const Faq = () => {
  return (
    <main
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px 16px",
        paddingBottom: "200px",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bcgov-background-white)",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid var(--bcgov-border-light)",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bcgov-blue)",
            padding: "24px",
            borderBottom: "4px solid var(--bcgov-gold)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: "var(--bcgov-text-white)",
              fontSize: "28px",
              fontWeight: 600,
              margin: "0",
            }}
          >
            Frequently Asked Questions (FAQ)
          </h1>
        </div>

        <div
          style={{
            padding: "32px",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              How often is the information Refreshed?
            </h2>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                Cheque verification portal data updates daily at 9 a.m. with
                prior day cashed cheque information.
              </li>
              <li style={{ marginBottom: "8px" }}>
                Please call the cheque verification line if the portal returns
                the message “Error. Cheque not found.”
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              Cheque Number:{" "}
              <span style={{ fontWeight: 400 }}>
                Enter the cheque number found on the top right of the cheque.
              </span>
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              Please note:
            </p>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                Monthly income assistance cheques have 7 numbers
              </li>
              <li style={{ marginBottom: "8px" }}>
                Imprest account income assistance cheques have 8 numbers
              </li>
            </ul>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <img
                src="/chequenumber.png"
                alt="Sample cheque showing where to find the cheque number in the top right corner"
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "auto",
                  border: "1px solid var(--bcgov-border-light)",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              Can you tell me why a cheque was issued or details about a
              client's payment history?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              No. Due to privacy regulations, we cannot provide details such as:
            </p>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>Why a cheque was issued</li>
              <li style={{ marginBottom: "8px" }}>
                How many cheques a client is supposed to receive
              </li>
              <li style={{ marginBottom: "8px" }}>Why a cheque was stopped</li>
              <li style={{ marginBottom: "8px" }}>
                Whether a client has a history of stopped cheques
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              Who do I call if I have further questions or concerns?
            </h2>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                For questions regarding the status of a cheque or if you receive
                a message "Error. Cheque not found," please call the cheque
                verification line.
              </li>
              <li style={{ marginBottom: "8px" }}>
                For all other inquiries, please call the Ministry contact center
                at <strong>1-866-866-0800</strong>
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              Do I have recourse if a cheque is returned to me by the bank?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              Yes. All claims for recourse in the wrongful cashing of
              non-fraudulent BC Benefits cheques are reviewed and determined on
              a case-by-case basis. Claims can be submitted for reimbursement to
              the Ministry by email to SDPR.FASB.Claims@gov.bc.ca.
            </p>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              The status provided on this site cannot be used as grounds for
              claiming recourse in the event of the wrongful cashing of a
              cheque. All applicable Canadian cheque-cashing rules and
              guidelines continue to apply.
            </p>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              When do BC Employment and Assistance cheques stale date?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              All BC Employment and Assistance Benefits cheques stale-date
              exactly 6 months after the item's issue date. Items cashed in a
              stale-dated state will not be considered as an item for
              reimbursement.
            </p>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
                borderBottom: "2px solid var(--bcgov-gold)",
                paddingBottom: "8px",
              }}
            >
              What are the common verification phone numbers for agencies?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              Here is a quick reference list:
            </p>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                <strong>MCFD Cheques:</strong> 250-356-8139
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Day Care Subsidy Cheques:</strong> 1-888-338-6622
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Family Maintenance Cheques:</strong> 1-800-663-9666 or
                604-678-5670
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Community Living Cheques:</strong> 604-664-0784
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Province of BC General / MSP / Payroll:</strong>{" "}
                1-888-587-7114
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Enquiry BC:</strong> 1-800-663-7867
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>
                  Province of BC Payment Enquiry (SSBC CAS Business Services):
                </strong>{" "}
                1-800-663-7867
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Federal Cheques:</strong> 1-866-552-8034
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Faq;
