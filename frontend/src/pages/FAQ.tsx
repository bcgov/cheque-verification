const FAQ = () => {
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
            Frequently Asked Questions
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
              Question 1?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              Answer 1.
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
              How often is the data updated?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              Cheque verification results are updated nightly at 3:00 AM PT. If
              your cheque was issued within the last 24 hours, it may not appear
              in the system until the next business day.
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
              What information do I need to verify a cheque?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              To verify a cheque, you need to provide:
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
                Cheque Number (found on your cheque)
              </li>
              <li style={{ marginBottom: "8px" }}>
                Payment Issue Date (the date the cheque was issued)
              </li>
              <li style={{ marginBottom: "8px" }}>
                Cheque Amount (the dollar amount on the cheque)
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
              What do the different cheque statuses mean?
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  color: "var(--bcgov-text-primary)",
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Valid Cheque Statuses:
              </h3>
              <ul
                style={{
                  color: "var(--bcgov-text-primary)",
                  fontSize: "16px",
                  marginLeft: "24px",
                  marginBottom: "16px",
                }}
              >
                <li style={{ marginBottom: "8px" }}>
                  <strong>Example1:</strong> The cheque has been created and is
                  ready to be cashed
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Example2:</strong> The cheque has been successfully
                  processed and cashed
                </li>
              </ul>
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
              What should I do if my cheque doesn't appear in the system?
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              If your cheque doesn't appear in the system, it could be because:
            </p>
            <ul
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginLeft: "24px",
                marginBottom: "16px",
              }}
            >
              <li style={{ marginBottom: "8px" }}>Example 1</li>
              <li style={{ marginBottom: "8px" }}>Example 2</li>
              <li style={{ marginBottom: "8px" }}>Example 3</li>
            </ul>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              Please double-check all the information and try again.
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
              Example Question
            </h2>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              Example Answer
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid var(--bcgov-border-light)",
              borderRadius: "6px",
              padding: "20px",
              marginTop: "32px",
            }}
          >
            <h3
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "12px",
                margin: "0 0 12px 0",
              }}
            >
              Need More Help?
            </h3>
            <p
              style={{
                color: "var(--bcgov-text-primary)",
                fontSize: "16px",
                margin: "0",
              }}
            >
              If you have additional questions or need assistance, please
              contact Example contact
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FAQ;
