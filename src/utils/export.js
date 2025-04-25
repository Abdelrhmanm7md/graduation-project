import * as csv from 'fast-csv';
import fs from 'fs';
import path from 'path';


const exportData = async (req, res, next, model, query = {}, projection = {}, selectedFields = [], specificIds = []) => {
  try {
    const filePath = path.resolve('./data.csv');
    const ws = fs.createWriteStream(filePath);

    // Parse selectedFields properly if it's a stringified array
    if (typeof selectedFields === "string") {
      try {
        selectedFields = JSON.parse(selectedFields); // Parse JSON string
      } catch (e) {
        selectedFields = selectedFields.split(","); // Fallback if not a JSON string
      }
    }

    // Ensure selectedFields is always an array
    if (!Array.isArray(selectedFields)) {
      selectedFields = [];
    }

    // Parse specificIds properly if it's a stringified array
    if (typeof specificIds === "string") {
      try {
        specificIds = JSON.parse(specificIds);
      } catch (e) {
        specificIds = specificIds.split(",");
      }
    }

    if (!Array.isArray(specificIds)) {
      specificIds = [];
    }

    // Apply filtering by specific IDs if provided
    if (specificIds.length > 0) {
      query._id = { $in: specificIds.map(id => id.toString()) };
    }

    // Always exclude _id
    let projection = { _id: 0 };

    // Apply selected fields if provided
    if (selectedFields.length > 0) {
      selectedFields.forEach(field => projection[field] = 1);
    }

    let data = await model.find(query, projection).lean(); // Use lean() for better performance

    csv.write(data, { headers: true })
      .pipe(ws)
      .on('finish', () => {
        res.download(filePath, 'data.csv', (err) => {
          if (err) {
            console.error(err);
            return next(res.json({ message: "Error", err }));
          }

          // Clean up the file after download
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error(unlinkErr);
          });
        });
      })
      .on('error', (err) => {
        console.error('Error writing CSV:', err);
        return next(res.json({ message: "Error writing CSV", err }));
      });
  } catch (err) {
    console.error('Error exporting data:', err);
    return next(res.json({ message: "Error exporting data", err }));
  }
};

export default exportData;

// import fs from "fs";
// import path from "path";
// import XLSX from "xlsx";

// const exportData = async (req, res, next, model, query = {}, specificIds = []) => {
//   try {
//     const filePath = path.resolve("./data.xlsx");

//     // Parse specificIds properly if it's a stringified array
//     if (typeof specificIds === "string") {
//       try {
//         specificIds = JSON.parse(specificIds);
//       } catch (e) {
//         specificIds = specificIds.split(",");
//       }
//     }

//     if (!Array.isArray(specificIds)) {
//       specificIds = [];
//     }

//     // Apply filtering by specific IDs if provided
//     if (specificIds.length > 0) {
//       query._id = { $in: specificIds.map(id => id.toString()) };
//     }

//     // Fetch all documents and exclude `_id`
//     let data = await model.find(query).select("-_id").lean();

//     if (!data.length) {
//       return res.status(404).json({ message: "No data found" });
//     }

//     // Convert JSON data to a worksheet
//     const worksheet = XLSX.utils.json_to_sheet(data);

//     // Create a new workbook
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");

//     // Write the Excel file
//     XLSX.writeFile(workbook, filePath);

//     // Send the file as a response
//     res.download(filePath, "data.xlsx", (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         return next(res.json({ message: "Error", err }));
//       }

//       // Remove the file after download
//       fs.unlink(filePath, (unlinkErr) => {
//         if (unlinkErr) console.error("Error deleting file:", unlinkErr);
//       });
//     });

//   } catch (err) {
//     console.error("Error exporting data:", err);
//     return next(res.json({ message: "Error exporting data", err }));
//   }
// };

// export default exportData;

