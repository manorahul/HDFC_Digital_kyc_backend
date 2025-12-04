// export const parseAadhaarText = (text) => {
//   const data = {};

//   const lines = text
//     .split("\n")
//     .map((line) => line.trim())
//     .filter((line) => line);

//   // Name
//   const govIndex = lines.findIndex((l) =>
//     l.toLowerCase().includes("government")
//   );

//   if (govIndex !== -1 && lines[govIndex + 1]) {
//     data.name = lines[govIndex + 1];
//   }

//   // Date of birth
//   const dob = text.match(/\d{2}\/\d{2}\/\d{4}/);
//   if (dob) data.dob = dob[0];

//   // Gender
//   if (/male/i.test(text)) data.gender = "Male";
//   if (/female/i.test(text)) data.gender = "Female";

//   // Aadhaar number
//   const aadhaar = text.match(/\d{4}\s\d{4}\s\d{4}/);
//   if (aadhaar) data.aadhaar_number = aadhaar[0];

//   return data;
// };




const cleanName = (line) => {
  let cleaned = line.replace(/[^A-Za-z ]/g, "").trim();

  let parts = cleaned.split(" ").filter(Boolean);

  // Remove single-letter prefix
  if (parts.length > 2 && parts[0].length === 1) {
    parts = parts.slice(1);
  }

  // Remove single-letter suffix
  if (parts.length > 2 && parts[parts.length - 1].length === 1) {
    parts = parts.slice(0, -1);
  }

  cleaned = parts.join(" ");

  if (parts.length < 2) return null;

  return cleaned;
};

export const parseAadhaarText = (text) => {
  const data = {};

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1: get DOB line index
  const dobRegex = /\d{2}\/\d{2}\/\d{4}/;
  const dobLineIndex = lines.findIndex((l) => dobRegex.test(l));

  // 2: Name = line before DOB
  if (dobLineIndex > 0) {
    const rawName = lines[dobLineIndex - 1];
    const name = cleanName(rawName);
    if (name) data.name = name;
  }

  // 3: fallback: line after Government
  if (!data.name) {
    const govIndex = lines.findIndex((l) =>
      l.toLowerCase().includes("government")
    );

    if (govIndex !== -1 && lines[govIndex + 1]) {
      const name = cleanName(lines[govIndex + 1]);
      if (name) data.name = name;
    }
  }

  // DOB
  const dobMatch = text.match(dobRegex);
  if (dobMatch) data.dob = dobMatch[0];

  // Gender
  if (/male/i.test(text)) data.gender = "Male";
  if (/female/i.test(text)) data.gender = "Female";

  // Aadhaar number
  const aadhaarMatch = text.match(/\d{4}\s\d{4}\s\d{4}/);
  if (aadhaarMatch) data.aadhaar_number = aadhaarMatch[0];

  return data;
};
