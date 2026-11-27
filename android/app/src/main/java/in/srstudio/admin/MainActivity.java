package in.srstudio.admin;

import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {
    private static final String RELEASE_API = "https://api.github.com/repos/srcreativ/srcreativ/releases/latest";
    private static final String APK_FILE_NAME = "sr-studio-admin-update.apk";
    private final ExecutorService updateExecutor = Executors.newSingleThreadExecutor();
    private long updateDownloadId = -1L;

    /** Exposes only the explicit update action to the authenticated web UI. */
    private final class AndroidUpdateBridge {
        @JavascriptInterface
        public void checkForUpdates() {
            checkForGithubUpdate(true);
        }
    }

    private final BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            long completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
            if (completedId == updateDownloadId) installDownloadedApk();
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.rgb(21, 20, 18));
        WindowInsetsControllerCompat insets =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        insets.setAppearanceLightStatusBars(false);
        insets.setAppearanceLightNavigationBars(false);
        configureWebView();
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(downloadReceiver, filter);
        }
        checkForGithubUpdate(false);
    }

    private void configureWebView() {
        WebView webView = getBridge().getWebView();
        webView.getSettings().setUseWideViewPort(false);
        webView.getSettings().setLoadWithOverviewMode(false);
        webView.addJavascriptInterface(new AndroidUpdateBridge(), "SRStudioAndroid");
    }

    private void checkForGithubUpdate(boolean initiatedByUser) {
        updateExecutor.execute(() -> {
            try {
                HttpURLConnection connection = (HttpURLConnection) new URL(RELEASE_API).openConnection();
                connection.setRequestProperty("Accept", "application/vnd.github+json");
                connection.setRequestProperty("User-Agent", "SR-Studio-Admin-Updater");
                connection.setConnectTimeout(8000);
                connection.setReadTimeout(8000);
                if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) return;

                StringBuilder response = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) response.append(line);
                }
                JSONObject release = new JSONObject(response.toString());
                String latest = release.optString("tag_name", "").replaceFirst("^android-v", "");
                String assetUrl = findApkAsset(release.optJSONArray("assets"));
                if (assetUrl != null && compareVersions(latest, BuildConfig.VERSION_NAME) > 0) {
                    runOnUiThread(() -> promptForUpdate(latest, assetUrl));
                } else if (initiatedByUser) {
                    runOnUiThread(() -> Toast.makeText(
                        MainActivity.this,
                        "SR Studio Admin is up to date",
                        Toast.LENGTH_SHORT
                    ).show());
                }
            } catch (Exception ignored) {
                if (initiatedByUser) {
                    runOnUiThread(() -> Toast.makeText(
                        MainActivity.this,
                        "Couldn't check for updates. Please try again.",
                        Toast.LENGTH_SHORT
                    ).show());
                }
            }
        });
    }

    private String findApkAsset(JSONArray assets) {
        if (assets == null) return null;
        for (int index = 0; index < assets.length(); index++) {
            JSONObject asset = assets.optJSONObject(index);
            if (asset == null) continue;
            String name = asset.optString("name", "").toLowerCase();
            if (name.endsWith(".apk")) return asset.optString("browser_download_url", null);
        }
        return null;
    }

    private void promptForUpdate(String version, String assetUrl) {
        new AlertDialog.Builder(this)
            .setTitle("SR Studio update available")
            .setMessage("Version " + version + " is ready to install from the official SR Studio GitHub release.")
            .setNegativeButton("Later", null)
            .setPositiveButton("Download", (dialog, which) -> downloadUpdate(assetUrl))
            .show();
    }

    private void downloadUpdate(String assetUrl) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
            settings.setData(Uri.parse("package:" + getPackageName()));
            startActivity(settings);
            return;
        }
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(assetUrl));
        request.setTitle("SR Studio Admin update");
        request.setDescription("Downloading update");
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, APK_FILE_NAME);
        DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
        updateDownloadId = manager.enqueue(request);
    }

    private void installDownloadedApk() {
        File apk = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), APK_FILE_NAME);
        if (!apk.exists()) return;
        Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", apk);
        Intent install = new Intent(Intent.ACTION_VIEW)
            .setDataAndType(uri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(install);
    }

    private int compareVersions(String left, String right) {
        String[] a = left.split("\\.");
        String[] b = right.split("\\.");
        int count = Math.max(a.length, b.length);
        for (int index = 0; index < count; index++) {
            int x = index < a.length ? parseVersionPart(a[index]) : 0;
            int y = index < b.length ? parseVersionPart(b[index]) : 0;
            if (x != y) return Integer.compare(x, y);
        }
        return 0;
    }

    private int parseVersionPart(String value) {
        try { return Integer.parseInt(value.replaceAll("[^0-9]", "")); }
        catch (NumberFormatException ignored) { return 0; }
    }

    @Override
    public void onDestroy() {
        try { unregisterReceiver(downloadReceiver); } catch (IllegalArgumentException ignored) { }
        updateExecutor.shutdownNow();
        super.onDestroy();
    }
}
