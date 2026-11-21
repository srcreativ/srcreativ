import DronePage from "./DroneModel.jsx";
import "./DroneShowcase.css";

/** The controller feed and the interactive aircraft share the same showcase. */
export function DroneShowcase({
  controllerImage = "/controller.png",
  droneVideo = "/drone_optimized.mp4",
}: {
  controllerImage?: string;
  droneVideo?: string;
}) {
  return (
    <section
      className="drone-showcase section-mask"
      aria-labelledby="aerial-showcase-title"
    >
      <div className="drone-showcase__ambient" aria-hidden="true" />
      <div className="drone-aircraft" aria-hidden="true">
        <DronePage />
      </div>
      <div className="drone-showcase__inner">
        <div className="drone-showcase__intro">
          <p className="eyebrow">Aerial perspective</p>
          <h2 id="aerial-showcase-title">
            See every celebration from a <em>new angle</em>
          </h2>
          <p className="drone-showcase__description">
            A live studio view of the camera system we use to frame the scale,
            energy, and detail of a wedding day.
          </p>
          <p className="drone-showcase__scroll-cue">
            Scroll to spin propellers
          </p>
        </div>

        <div className="drone-showcase__telemetry">
          <p className="eyebrow">Live 4K telemetry · active</p>
          <div className="drone-controller">
            <img
              src={controllerImage}
              alt="Drone remote controller"
              draggable="false"
            />
            <div className="drone-controller__screen" aria-hidden="true">
              <video
                src={droneVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
              />
            </div>
          </div>
          <div className="drone-showcase__story">
            <p className="eyebrow">Aerial films</p>
            <p>Capturing fleeting moments from a higher perspective.</p>
          </div>
          <div className="drone-showcase__readout" aria-hidden="true">
            <span>4K · 25 FPS · Stabilized flight</span>
            <span>GPS LOCK · 0.9 KM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
