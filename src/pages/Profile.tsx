import React from "react";

const Profile = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Mission Profile</h1>
        <p className="text-gray-500">
          Your personal operating system and life dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Identity</h2>

          <div className="space-y-2">
            <p>
              <strong>Name:</strong> Samyak Mishra
            </p>
            <p>
              <strong>Status:</strong> Final Year CSE Student
            </p>
            <p>
              <strong>Graduation:</strong> July 2026
            </p>
            <p>
              <strong>Current Phase:</strong> Student → Professional
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Primary Goals</h2>

          <ul className="space-y-2">
            <li>🎯 GATE 2027 (PSU Route)</li>
            <li>🛡️ IB Preparation</li>
            <li>💻 Cybersecurity Skills</li>
            <li>🏋️ Fitness & Health</li>
            <li>🎸 Guitar Growth</li>
          </ul>
        </div>

        <div className="rounded-xl border p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Current Timeline</h2>

          <div className="space-y-2">
            <p>📚 Semester Exams: June 27, June 30, July 2, July 16</p>
            <p>🏢 Fractal Pre-Boarding: Ends July 12</p>
            <p>🎓 Graduation: July 2026</p>
            <p>🚀 Estimated Joining: September 2026</p>
          </div>
        </div>

        <div className="rounded-xl border p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Personal Rules</h2>

          <ul className="space-y-2">
            <li>✅ No Zero Days</li>
            <li>✅ Track Progress Daily</li>
            <li>✅ Study Before Entertainment</li>
            <li>✅ Build Consistency Over Intensity</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Why Mission Control Exists
        </h2>

        <p className="leading-7 text-gray-700">
          Mission Control exists to ensure every hour is accounted for.
          Its purpose is to help me transition from student life to
          professional life while preparing for GATE 2027, government
          exams, fitness goals, and personal growth.
        </p>
      </div>

      <div className="rounded-xl border p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Future Self Vision</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div>✔ Disciplined</div>
          <div>✔ Technically Strong</div>
          <div>✔ Financially Stable</div>
          <div>✔ Fit & Healthy</div>
          <div>✔ GATE Qualified</div>
          <div>✔ Career Ready</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;