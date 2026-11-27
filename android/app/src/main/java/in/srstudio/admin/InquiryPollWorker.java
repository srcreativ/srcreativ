package in.srstudio.admin;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Polls the Cloudflare D1-backed, status-only inquiry endpoint. Android batches
 * periodic work; this is deliberately a generic notification with no customer PII.
 */
public final class InquiryPollWorker extends Worker {
    private static final String STATUS_URL = "https://srcreativ.srcreativ92.workers.dev/api/inquiries/status";
    private static final String PREFS = "sr_studio_inquiry_status";
    private static final String KEY_COUNT = "count";
    private static final String CHANNEL_ID = "sr_studio_inquiries";

    public InquiryPollWorker(@NonNull Context context, @NonNull WorkerParameters parameters) {
        super(context, parameters);
    }

    @NonNull
    @Override
    public Result doWork() {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(STATUS_URL).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "application/json");
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) return Result.retry();

            StringBuilder body = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) body.append(line);
            }
            int count = new JSONObject(body.toString()).optInt("count", -1);
            if (count < 0) return Result.retry();

            SharedPreferences preferences = getApplicationContext()
                .getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (!preferences.contains(KEY_COUNT)) {
                preferences.edit().putInt(KEY_COUNT, count).apply();
                return Result.success();
            }
            int previous = preferences.getInt(KEY_COUNT, count);
            preferences.edit().putInt(KEY_COUNT, count).apply();
            if (count > previous) showNotification();
            return Result.success();
        } catch (Exception ignored) {
            return Result.retry();
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private void showNotification() {
        Context context = getApplicationContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "Inquiry alerts", NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("New SR Studio website inquiries");
            context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_sr_studio_launcher)
            .setContentTitle("New SR Studio inquiry")
            .setContentText("Open SR Studio Admin to review it.")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true);
        NotificationManagerCompat.from(context).notify(4101, notification.build());
    }
}
