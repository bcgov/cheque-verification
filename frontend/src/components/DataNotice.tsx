/**
 * DataNotice component for displaying important cheque verification timing information
 * Follows BC Government design system standards with proper danger styling
 */
const DataNotice = () => {
  return (
    <div
      role="note"
      aria-label="Cheque verification data notice"
      style={{
        padding: "16px",
        backgroundColor: "#F4E1E2",
        borderRadius: "6px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "1px solid #CE3E39",
        margin: "24px auto",
        maxWidth: "800px",
        color: "#CE3E39 !important",
      }}
    >
      <p
        style={{
          margin: "0 0 8px 0",
          color: "#CE3E39 !important",
          fontFamily: "BCSans, sans-serif",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        <strong
          style={{
            color: "#CE3E39 !important",
          }}
        >
          Important data notice
        </strong>
      </p>
      <p
        style={{
          margin: "0",
          color: "#CE3E39 !important",
          fontFamily: "BCSans, sans-serif",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        Cheque Verification results updates daily at 6 a.m. PT. Cheques issued
        within the last 24 business hours may not appear until the next business
        day.
      </p>
    </div>
  );
};

export default DataNotice;
