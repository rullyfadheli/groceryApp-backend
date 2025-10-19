/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__test__/**/*.test.ts"], // Pola untuk menemukan file tes
  verbose: true, // Tampilkan laporan tes yang detail
  forceExit: true, // Paksa keluar setelah tes selesai
  clearMocks: true, // Otomatis membersihkan mock di antara setiap tes
};
