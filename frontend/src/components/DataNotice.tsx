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
          margin: "0 0 8px 0",
          color: "#CE3E39 !important",
          fontFamily: "BCSans, sans-serif",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        Cheque verification portal data updates daily at 9 a.m. with prior day
        cashed cheque information.
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
        The status provided on this site cannot be used as grounds for claiming
        recourse in the event of the wrongful cashing of a cheque. All
        applicable Canadian cheque-cashing rules and guidelines continue to
        apply.
      </p>
    </div>
  );
};

export default DataNotice;
