// import React from 'react';
// import Navbar from '../components/layout/Navbar';
// import Footer from '../components/layout/Footer';
// import '../styles/AboutUs.css';

// const PrivacyPolicy = () => {
//   return (
//     <>
//       <Navbar />
//       <div className="about-us">
//         <div className="about-us-container">
//           <h1>Privacy Policy</h1>
//           <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
//             <p><strong>Last Updated: January 2025</strong></p>
            
//             <h2>1. Introduction</h2>
//             <p>
//               Welcome to Sankalpam. We are committed to protecting your privacy and ensuring the security of your personal information. 
//               This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
//               and use our services.
//             </p>

//             <h2>2. Information We Collect</h2>
//             <p>
//               We may collect information about you in a variety of ways. The information we may collect includes:
//             </p>
//             <ul>
//               <li>Personal identification information (name, email address, phone number)</li>
//               <li>Payment information (processed securely through third-party payment processors)</li>
//               <li>Booking and service preferences</li>
//               <li>Device information and usage data</li>
//             </ul>

//             <h2>3. How We Use Your Information</h2>
//             <p>
//               We use the information we collect to:
//             </p>
//             <ul>
//               <li>Process and manage your bookings and orders</li>
//               <li>Communicate with you about your services</li>
//               <li>Improve our website and services</li>
//               <li>Send you promotional materials (with your consent)</li>
//               <li>Comply with legal obligations</li>
//             </ul>

//             <h2>4. Data Security</h2>
//             <p>
//               We implement appropriate technical and organizational security measures to protect your personal information. 
//               However, no method of transmission over the Internet is 100% secure.
//             </p>

//             <h2>5. Contact Us</h2>
//             <p>
//               If you have any questions about this Privacy Policy, please contact us at sankalpamofficial@gmail.com
//             </p>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default PrivacyPolicy;



import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/AboutUs.css';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="about-us">
        <div className="about-us-container">
          <h1>Privacy Policy</h1>

          <div
            style={{
              textAlign: 'left',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.9',
              fontSize: '16px'
            }}
          >
            <p><strong>Last updated: 21/05/2024</strong></p>

            <h2>1. Introduction</h2>
            <p>
              Welcome to Sankalpam. This privacy policy explains how we collect, use, disclose,
              and safeguard your information when you visit our Site and use our App. Please
              read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the Site or use the App.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we
              may collect via the App includes:
            </p>

            <h3>2.1 Personal Data</h3>
            <p>
              Personally identifiable information, such as your name, billing address,
              email address, and mobile number that you voluntarily give to us when you
              register with the App or when you choose to participate in various activities
              related to the App.
            </p>

            <h3>2.2 Derivative Data</h3>
            <p>
              Information our servers automatically collect when you access the App, such as
              your IP address, your browser type, your operating system, your access times,
              and the pages you have viewed directly before and after accessing the App.
            </p>

            <h3>2.3 Mobile Device Access</h3>
            <p>
              We may request access or permission to certain features from your mobile device,
              including camera, contacts, storage, location, etc. You may change permissions
              in your device settings.
            </p>

            <h3>2.4 Mobile Device Data</h3>
            <p>
              Device information such as device ID, model, manufacturer, operating system
              version, country, location, and other data you choose to provide.
            </p>

            <h3>2.5 Push Notifications</h3>
            <p>
              We may send push notifications related to your account or services. You can opt
              out from your device settings.
            </p>

            <h2>3. Use of Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Provide and improve our services</li>
              <li>Communicate with you</li>
              <li>Enhance security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Security of Your Information</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards to protect
              your information.
            </p>

            <h2>5. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us:
            </p>
            <p><strong>Sankalpam</strong></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
