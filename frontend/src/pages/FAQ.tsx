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
              fontFamily: "BCSans, sans-serif",
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
            fontFamily: "BCSans, sans-serif",
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
                Cheque information is refreshed daily at 6AM.
              </li>
              <li style={{ marginBottom: "8px" }}>
                This information captures data from previous day, information
                cut off at 5pm.
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
              Cheque #: Enter in top right Cheque # Information.
            </h2>
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
                  maxWidth: "100px",
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
