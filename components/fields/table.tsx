import * as React from "react";
import { FaPlusCircle, FaTrashAlt, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { wrapFieldsWithMeta } from "tinacms";
import { ASIN, findAsin } from "../../lib/asin.mjs";


export const TableInput = wrapFieldsWithMeta(({ input }) => {

  const onChange = input.onChange;
  const headers = input.value.headers
  const rows = input.value.rows

  const [cellModes, setCellModes] = React.useState([]);

  const emptyCell = {content: ''}

    const handleAddRow = () => {
      const newRow = {cells: Array(headers.length).fill(emptyCell)};
      const updatedRows = [...rows, newRow];
      onChange({ headers, rows: updatedRows });
    };
  
    const handleAddColumn = () => {
      let updatedHeaders;
      let updatedRows;
    
      if ((!headers || headers.length === 0) && (!rows || rows.length === 0)) {
        updatedHeaders = [{content: ''}];
        updatedRows = [{cells: [emptyCell]}];
      } else if (!headers || headers.length === 0) {
        updatedHeaders = [{content: ''}];
        updatedRows = rows.map(row => {return { cells: [...row.cells, emptyCell]}});
      } else {
        updatedHeaders = [...headers, {content: ''}];
        updatedRows = rows.map(row => {return { cells: [...row.cells, emptyCell]}});
      }
    
      onChange({ headers: updatedHeaders, rows: updatedRows });
    };
  
    const handleRemoveColumn = columnIndex => {
      const updatedHeaders = headers.filter((_, index) => index !== columnIndex);
      const updatedRows = rows.map(row => {return {cells: row.cells.filter((_, index) => index !== columnIndex)}});
      onChange({ headers: updatedHeaders, rows: updatedRows });
    };
  
    const handleMoveColumnLeft = columnIndex => {
      if (columnIndex > 0) {
        const updatedHeaders = [...headers];
        const tempHeaders = updatedHeaders[columnIndex - 1];
        updatedHeaders[columnIndex - 1] = updatedHeaders[columnIndex];
        updatedHeaders[columnIndex] = tempHeaders;
        const updatedRows = rows.map(row => {
          const updatedRow = [...row.cells];
          const temp = updatedRow[columnIndex - 1];
          updatedRow[columnIndex - 1] = updatedRow[columnIndex];
          updatedRow[columnIndex] = temp;
          return {cells: updatedRow};
        });
        onChange({ headers: updatedHeaders, rows: updatedRows });
      }
    };
  
    const handleMoveColumnRight = columnIndex => {
      if (columnIndex < headers.length - 1) {
        const updatedHeaders = [...headers];
        const tempHeaders = updatedHeaders[columnIndex + 1];
        updatedHeaders[columnIndex + 1] = updatedHeaders[columnIndex];
        updatedHeaders[columnIndex] = tempHeaders;
        const updatedRows = rows.map(row => {
          const updatedRow = [...row.cells];
          const temp = updatedRow[columnIndex + 1];
          updatedRow[columnIndex + 1] = updatedRow[columnIndex];
          updatedRow[columnIndex] = temp;
          return {cells: updatedRow};
        });
        onChange({ headers: updatedHeaders, rows: updatedRows });
      }
    };
  
    const handleMoveRowUp = rowIndex => {
      if (rowIndex > 0) {
        const updatedRows = [...rows];
        const temp = updatedRows[rowIndex - 1];
        updatedRows[rowIndex - 1] = updatedRows[rowIndex];
        updatedRows[rowIndex] = temp;
        onChange({ headers, rows: updatedRows });
      }
    };
  
    const handleMoveRowDown = rowIndex => {
      if (rowIndex < rows.length - 1) {
        const updatedRows = [...rows];
        const temp = updatedRows[rowIndex + 1];
        updatedRows[rowIndex + 1] = updatedRows[rowIndex];
        updatedRows[rowIndex] = temp;
        onChange({ headers, rows: updatedRows });
      }
    };
  
    const handleRemoveRow = rowIndex => {
      const updatedRows = rows.filter((_, index) => index !== rowIndex);
      onChange({ headers, rows: updatedRows });
    };

    const handleCellValueChange = (rowIndex, columnIndex, value) => {
      const updatedRows = rows.map((row, index) =>
          index === rowIndex ? {cells: [...row.cells.slice(0, columnIndex), {...row.cells[columnIndex], content: value}, ...row.cells.slice(columnIndex + 1)]} : row
        )
        console.log('handleCellValueChange')
        onChange({ headers, rows: updatedRows }); 
    };

    const handleHeaderValueChange = (columnIndex, value) => {
      const updatedHeaders = headers.map((header, index) =>
          index === columnIndex ? {content: value} : header
        )
        onChange({ headers : updatedHeaders, rows }); 
    };

    // Merges changes into a cell's affiliate product, dropping it once every field is empty
    const handleAffiliateChange = (rowIndex, cellIndex, changes) => {
      const {affiliate, ...newCell} = rows[rowIndex].cells[cellIndex]
      const updated = { ...affiliate, ...changes }
      const hasContent = ["asin", "linkURL", "imageURL", "caption"].some((key) => updated[key])

      const updatedRows = rows.map((row, index) =>
        index === rowIndex ? {cells: [...row.cells.slice(0, cellIndex), hasContent ? { ...newCell, affiliate: updated } : newCell, ...row.cells.slice(cellIndex + 1)]} : row
      );
      onChange({ headers, rows: updatedRows });
    }
  
    return (
      <div>
        <table>
          <thead className="bg-gray-50">
            <tr>
              <div></div>
              {headers && headers.length > 0 && headers.map((header, columnIndex) => (
                <th key={columnIndex} className="p-0 border-2 border-gray-400">
                  <div className="flex flex-col">
                    <div className="flex justify-center p-2">
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
                  </div>
                  <input
                    type="text"
                    value={header.content ? header.content: ''}
                    onChange={(e) => handleHeaderValueChange(columnIndex, e.target.value)}
                    className="w-full"
                  />
  
                </th>
              ))}
              <button className="mr-2" onClick={handleAddColumn}>
                <FaPlusCircle className="text-blue-500" />
              </button>
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 && rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="p-0 ">
                  <div className="pt-1">
                    <button onClick={() => handleMoveRowUp(rowIndex)}>
                      <FaChevronUp className="text-gray-500" />
                    </button>
                    <button onClick={() => handleMoveRowDown(rowIndex)}>
                      <FaChevronDown className="text-gray-500" />
                    </button>
                  
                    <button onClick={() => handleRemoveRow(rowIndex)}>
                      <FaTrashAlt className="text-gray-500" />
                    </button>
                  </div>
                {row.cells && row.cells.length > 0 && row.cells.map((cell, columnIndex) => (
                  <td key={columnIndex} className="border-2 border-gray-400 p-0">
                  <div className="flex flex-col">
                  <textarea
                    value={cell.content || ''}
                    onChange={(e) => handleCellValueChange(rowIndex, columnIndex, e.target.value)}
                    className="w-full text-sm"
                  />
                  <label className="text-xs pt-2">Amazon Product (link or ASIN)</label>
                  <input
                      name="asin"
                      type="string"
                      className="text-xs"
                      value={cell.affiliate?.asin || ''}
                      // Keeps just the ASIN when one is pasted; the image and link are filled in when published
                      onChange={(e) => handleAffiliateChange(rowIndex, columnIndex, { asin: findAsin(e.target.value) ?? e.target.value })}
                  />
                  {cell.affiliate?.asin && !ASIN.test(cell.affiliate.asin) && (
                    <span className="text-xs text-red-500">No Amazon product found in that</span>
                  )}
                  <label className="text-xs pt-1">Caption</label>
                  <input
                      name="caption"
                      id="caption"
                      type="string"
                      className="text-xs"
                      value={cell.affiliate?.caption || ''}
                      onChange={(e) => handleAffiliateChange(rowIndex, columnIndex, { caption: e.target.value })}
                  />
                  <label className="text-xs pt-1">Not on Amazon? Image URL</label>
                  <input
                      name="imageURL"
                      id="imageURL"
                      type="string"
                      className="text-xs"
                      value={cell.affiliate?.imageURL || ''}
                      onChange={(e) => handleAffiliateChange(rowIndex, columnIndex, { imageURL: e.target.value })}
                  />
                  <label className="text-xs pt-1">Not on Amazon? Link URL</label>
                  <input
                      name="LinkURL"
                      id="linkURL"
                      type="string"
                      className="text-xs"
                      value={cell.affiliate?.linkURL || ''}
                      onChange={(e) => handleAffiliateChange(rowIndex, columnIndex, { linkURL: e.target.value })}
                  />
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
  