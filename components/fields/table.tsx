import * as React from "react";
import { FaPlusCircle, FaTrashAlt, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { wrapFieldsWithMeta } from "tinacms";


//export const ColorPickerInput = wrapFieldsWithMeta(({ input }) => {



export const TableInput = wrapFieldsWithMeta(({ input }) => {

  const jsonData = input.value.replace(/'/g, '"');

  const parsedData = jsonData && jsonData.length > 0 ? JSON.parse(jsonData) : {}

  const onChange = input.onChange;
  const headers = parsedData.headers;
  const rows = parsedData.rows;

  const [cellModes, setCellModes] = React.useState([]);

  // Function to initialize the cell modes based on the initial data
  const initializeCellModes = () => {
    if (!rows || rows.length === 0 || !headers || headers.length === 0) {
      setCellModes([]);
      return;
    }
    const initialModes = rows.map(() => Array(headers.length).fill('text'));
    setCellModes(initialModes);
  };
  
  React.useEffect(() => {
    initializeCellModes();
  }, [headers, rows]);

  const toggleCellMode = (rowIndex, cellIndex) => {
    if (cellModes.length === 0) return;
  
    const updatedModes = cellModes.map((row, index) =>
      index === rowIndex ? [...row.slice(0, cellIndex), row[cellIndex] === 'text' ? 'affiliate' : 'text', ...row.slice(cellIndex + 1)] : row
    );
    setCellModes(updatedModes);
  };

  const updateData = (newData) => {
    const dataString = JSON.stringify(newData)
    const escapedString = dataString.replace(/"/g, '\'');
    onChange(escapedString)
  }

    const handleAddRow = () => {
      const newRow = Array(headers.length).fill('');
      const updatedRows = [...rows, newRow];
      updateData({ headers, rows: updatedRows });
    };
  
    const handleAddColumn = () => {
      let updatedHeaders;
      let updatedRows;
    
      if ((!headers || headers.length === 0) && (!rows || rows.length === 0)) {
        updatedHeaders = [''];
        updatedRows = [['']];
      } else if (!headers || headers.length === 0) {
        updatedHeaders = [''];
        updatedRows = rows.map(row => [...row, '']);
      } else {
        updatedHeaders = [...headers, ''];
        updatedRows = rows.map(row => [...row, '']);
      }
    
      updateData({ headers: updatedHeaders, rows: updatedRows });
    };
  
    const handleRemoveColumn = columnIndex => {
      const updatedHeaders = headers.filter((_, index) => index !== columnIndex);
      const updatedRows = rows.map(row => row.filter((_, index) => index !== columnIndex));
      updateData({ headers: updatedHeaders, rows: updatedRows });
    };
  
    const handleMoveColumnLeft = columnIndex => {
      if (columnIndex > 0) {
        const updatedHeaders = [...headers];
        const updatedRows = rows.map(row => {
          const updatedRow = [...row];
          const temp = updatedRow[columnIndex - 1];
          updatedRow[columnIndex - 1] = updatedRow[columnIndex];
          updatedRow[columnIndex] = temp;
          return updatedRow;
        });
        updateData({ headers: updatedHeaders, rows: updatedRows });
      }
    };
  
    const handleMoveColumnRight = columnIndex => {
      if (columnIndex < headers.length - 1) {
        const updatedHeaders = [...headers];
        const updatedRows = rows.map(row => {
          const updatedRow = [...row];
          const temp = updatedRow[columnIndex + 1];
          updatedRow[columnIndex + 1] = updatedRow[columnIndex];
          updatedRow[columnIndex] = temp;
          return updatedRow;
        });
        updateData({ headers: updatedHeaders, rows: updatedRows });
      }
    };
  
    const handleMoveRowUp = rowIndex => {
      if (rowIndex > 0) {
        const updatedRows = [...rows];
        const temp = updatedRows[rowIndex - 1];
        updatedRows[rowIndex - 1] = updatedRows[rowIndex];
        updatedRows[rowIndex] = temp;
        updateData({ headers, rows: updatedRows });
      }
    };
  
    const handleMoveRowDown = rowIndex => {
      if (rowIndex < rows.length - 1) {
        const updatedRows = [...rows];
        const temp = updatedRows[rowIndex + 1];
        updatedRows[rowIndex + 1] = updatedRows[rowIndex];
        updatedRows[rowIndex] = temp;
        updateData({ headers, rows: updatedRows });
      }
    };
  
    const handleRemoveRow = rowIndex => {
      const updatedRows = rows.filter((_, index) => index !== rowIndex);
      updateData({ headers, rows: updatedRows });
    };

    /*const handleCellValueChange = (rowIndex, columnIndex, value) => {
      const updatedRows = rows.map((row, index) =>
          index === rowIndex ? [...row.slice(0, columnIndex), value, ...row.slice(columnIndex + 1)] : row
        )
        updateData({ headers, rows: updatedRows }); 
    };*/

    const handleLinkUrlChange = (rowIndex, cellIndex, value) => {
      const updatedRows = rows.map((row, index) =>
        index === rowIndex ? [...row.slice(0, cellIndex), { ...row[cellIndex], linkUrl: value }, ...row.slice(cellIndex + 1)] : row
      );
      onChange({ headers, rows: updatedRows });
    };
    
    const handleImageUrlChange = (rowIndex, cellIndex, value) => {
      const updatedRows = rows.map((row, index) =>
        index === rowIndex ? [...row.slice(0, cellIndex), { ...row[cellIndex], productUrl: value }, ...row.slice(cellIndex + 1)] : row
      );
      onChange({ headers, rows: updatedRows });
    };

    const handleHeaderValueChange = (columnIndex, value) => {
      const updatedHeaders = headers.map((header, index) =>
          index === columnIndex ? value : header
        )
        updateData({ headers : updatedHeaders, rows }); 
    };
  
    return (
      <div>
        <table>
          <thead>
            <tr>
              <div></div>
              {headers && headers.length > 0 && headers.map((header, columnIndex) => (
                <th key={columnIndex}>
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderValueChange(columnIndex, e.target.value)}
                  />
                  <div className="flex items-center mt-1">
                    <button className="mr-1" onClick={() => handleMoveColumnLeft(columnIndex)}>
                      <FaChevronLeft className="text-gray-500" />
                    </button>
                    <button className="mr-1" onClick={() => handleMoveColumnRight(columnIndex)}>
                      <FaChevronRight className="text-gray-500" />
                    </button>
                    <button onClick={() => handleRemoveColumn(columnIndex)}>
                      <FaTrashAlt className="text-gray-500" />
                    </button>
                  </div>
                </th>
              ))}
              <button className="mr-2" onClick={handleAddColumn}>
                <FaPlusCircle className="text-blue-500" />
              </button>
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 && rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                  <div>
                    <button className="mb-1" onClick={() => handleMoveRowUp(rowIndex)}>
                      <FaChevronUp className="text-gray-500" />
                    </button>
                    <button onClick={() => handleMoveRowDown(rowIndex)}>
                      <FaChevronDown className="text-gray-500" />
                    </button>
                  
                    <button onClick={() => handleRemoveRow(rowIndex)}>
                      <FaTrashAlt className="text-gray-500" />
                    </button>
                  </div>
                {row.length > 0 && row.map((cell, columnIndex) => (
                  <td key={columnIndex} className="border-2 px-4 py-2">
                  {cellModes[rowIndex][columnIndex] === 'text' && (
                    <div className="whitespace-pre-wrap items-top">{cell.content && cell.content}</div>
                  )}
                  {cellModes[rowIndex][columnIndex] === 'affiliate' && (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={cell.linkUrl || ''}
                        onChange={(e) => handleLinkUrlChange(rowIndex, columnIndex, e.target.value)}
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={cell.productUrl || ''}
                        onChange={(e) => handleImageUrlChange(rowIndex, columnIndex, e.target.value)}
                        placeholder="Product URL"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-end">
                    <button onClick={() => toggleCellMode(rowIndex, columnIndex)}>
                      {cellModes[rowIndex][columnIndex] === 'text' ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.707 3.293A1 1 0 0111 4.586l2 2V8a1 1 0 01-2 0V6.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3zM4 10a1 1 0 011-1h2.586l-1.293-1.293a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 11H5a1 1 0 01-1-1zm12-1a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 010-2h3V10h-3a1 1 0 010-2h4zm-2-8H6a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V4a3 3 0 00-3-3zm1 11a1 1 0 01-1 1H6a1 1 0 01-1-1v-5h10v5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15.293 3.293a1 1 0 010 1.414L13.414 6l1.88 1.88a1 1 0 11-1.414 1.414L12 7.414l-1.88 1.88a1 1 0 11-1.414-1.414L10.586 6l-1.88-1.88a1 1 0 111.414-1.414L12 4.586l1.88-1.88a1 1 0 111.414 1.414L13.414 6l1.879-1.88a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>

                ))}
              </tr>
            ))}
            {headers && headers.length > 0 && (
              <button className="mr-2" onClick={handleAddRow}>
                <FaPlusCircle className="text-blue-500" />
              </button>
            )}
          </tbody>
        </table>
      </div>
    );
}
);
  