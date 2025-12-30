
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/AboutUs.css';

const RefundPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="about-us">
        <div className="about-us-container">
          <h1>Refund Policy</h1>
          <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <p><strong>Last Updated:  28/12/2025</strong></p>

            <p>
              Any refund for services subscribed through <strong>Sankalpam</strong> shall be governed by the refund
              policy outlined below. By subscribing to our services, customers agree to comply with the terms stated herein.
            </p>

            <h2>1. Cancellation and Refunds</h2>

            <p>
              Customers may place a cancellation request <strong>within 24 hours from the date of payment</strong> for
              the services opted. Cancellation requests must be sent to
              <strong> sankalpamofficial@gmail.com</strong> with the subject line
              <strong> “Cancellation Request”</strong>, clearly mentioning the Customer ID, Property ID, and payment details.
            </p>

            <p>
              Customers may place a cancellation request <strong>after 24 hours but within 15 days</strong> from the date
              of payment, subject to acceptance by Sankalpam. In such cases, the customer will be eligible for a
              <strong> 50% refund</strong> of the subscription amount.
            </p>

            <p>
              Customers will be eligible for a refund if they are unable to identify the site during a joint inspection
              conducted along with Sankalpam. In such scenarios, <strong>30% of the amount</strong> shall be deducted
              towards inspection charges, and the remaining balance will be refunded after due review and acceptance.
            </p>

            <p>
              Sankalpam will review accepted cancellation requests and arrange refunds within
              <strong> 15 working days</strong> from the date of acceptance.
            </p>

            <p>
              Sankalpam’s decision regarding cancellation and refunds shall be
              <strong> final and binding</strong> on the customer.
            </p>

            <h2>2. Refund Process</h2>

            <p>
              Sankalpam acts solely as a facilitator on behalf of the customer and shall not be held responsible for
              delays caused by external agencies such as banks, payment gateways, or government departments.
              All refund-related activities are carried out on a <strong>best-effort basis</strong>.
            </p>

            <p>
              Refunds will be processed within <strong>15 working days</strong> from the date the cancellation request
              is accepted by the company. Actual credit timelines may vary depending on banking channels and card
              companies involved in the transaction.
            </p>

            <p>
              Sankalpam’s decision regarding the refund process shall be
              <strong> final and binding</strong>.
            </p>

            <h2>3. Applicability</h2>

            <p>
              This refund policy is generally applicable to all services offered by Sankalpam. However, the company
              may define specific or individual refund policies for certain services. In the event of any conflict
              or contradiction, the individual service-specific refund policy shall prevail over this general policy.
            </p>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RefundPolicy;


