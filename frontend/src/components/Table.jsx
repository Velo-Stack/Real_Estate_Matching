import '../styles/Table.css';

const Table = ({ columns, data, actions }) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
            {actions && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="actions-cell">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-state">
                لا توجد بيانات للعرض
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
