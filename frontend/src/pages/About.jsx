export default function About() {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-9">
        <div className="card form-card mb-4 emblem-watermark">
          <div className="card-body p-4 p-md-5">
            <span className="emblem-medallion medallion-md mb-3">
              <img src="/assets/ap-emblem.jpg" alt="Andhra Pradesh State Emblem" />
            </span>
            <div className="eyebrow mb-1">Government of Andhra Pradesh</div>
            <h2 className="mb-3">About Sachivalayam Portal</h2>
            <p className="text-muted">
              Sachivalayam Portal is a unified, citizen-friendly digital gateway to government
              services, welfare schemes, and civic grievance redressal — bringing the village
              and ward secretariat (Sachivalayam) experience online.
            </p>

            <hr className="my-4" />

            <h4>What is Sachivalayam?</h4>
            <p className="text-muted">
              A Sachivalayam (village or ward secretariat) is the smallest unit of local
              government administration, set up to deliver public services directly to
              citizens at their doorstep. It acts as a single-window centre where residents
              can apply for certificates, enrol in welfare schemes, and raise civic complaints,
              without having to visit multiple government offices.
            </p>

            <h4 className="mt-4">Purpose of this Project</h4>
            <p className="text-muted">
              This portal digitizes the core functions of a Sachivalayam so that citizens can:
            </p>
            <ul className="text-muted">
              <li>Apply for certificates and services online, from anywhere, at any time.</li>
              <li>Upload supporting documents instead of carrying physical paperwork.</li>
              <li>Track the real-time status of their applications and complaints.</li>
              <li>Discover government welfare schemes they may be eligible for.</li>
              <li>Register and follow up on civic complaints related to roads, water, drainage, and street lighting.</li>
              <li>Receive automatic email/SMS notifications at every step of the process.</li>
            </ul>

            <h4 className="mt-4">Benefits to Citizens</h4>
            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <div className="p-3 quick-card h-100">
                  <i className="fa-solid fa-clock text-primary mb-2"></i>
                  <h6>Saves Time</h6>
                  <p className="text-muted small mb-0">No long queues — apply for services and track status from home.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 quick-card h-100">
                  <i className="fa-solid fa-eye text-primary mb-2"></i>
                  <h6>Transparency</h6>
                  <p className="text-muted small mb-0">Every application and complaint has a visible, trackable status timeline.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 quick-card h-100">
                  <i className="fa-solid fa-bell text-primary mb-2"></i>
                  <h6>Timely Updates</h6>
                  <p className="text-muted small mb-0">Automatic notifications keep citizens informed at every stage.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 quick-card h-100">
                  <i className="fa-solid fa-mobile-screen text-primary mb-2"></i>
                  <h6>Accessible Anywhere</h6>
                  <p className="text-muted small mb-0">Fully responsive design works on mobile, tablet, and desktop.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
