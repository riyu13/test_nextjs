"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PiExportBold } from "react-icons/pi";
import { AiOutlineCaretDown } from "react-icons/ai";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface SalesData {
  delivery_fee: number;
  id: number;
  sale_code: string;
  customer: {
    name: string;
  };
  total: number;
  date: string;
}

export default function Home() {
  const [data, setData] = useState<SalesData[]>([]);
  const [uniqueDates, setUniqueDates] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [hiddenItems, setHiddenItems] = useState<Record<string, boolean>>({});
   const dateFormat = "DD MMMM YYYY";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedStartDate = dateRange[0]
          ? dayjs(dateRange[0]).format("DD-MM-YYYY")
          : "";
        const formattedEndDate = dateRange[1]
          ? dayjs(dateRange[1]).format("DD-MM-YYYY")
          : "";

        const response = await axios.get(
          `https://4771d15e-8011-4829-bafb-87c538aacc11.mock.pstmn.io/api/v0/sales/sales/list?order=ASC&page=1&take=150&start_date=${formattedStartDate}&finish_date=${formattedEndDate}`
        );
        setData(response.data.data);
        console.log("Data", response.data.data);

        const uniqueDatesSet = new Set<string>(
          response.data.data.map((item: SalesData) => item.date)
        );
        setUniqueDates(uniqueDatesSet);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data:", error);
      }
    };

    fetchData();
  }, [dateRange]);

  const toggleItemVisibility = (date: string) => {
    setHiddenItems((prevHiddenItems) => ({
      ...prevHiddenItems,
      [date]: !prevHiddenItems[date],
    }));
  };

 const generatePDF = (selectedDate: string) => {
   const doc = new jsPDF();
   doc.text("GRAHA BANGUNAN", 10, 10);
   doc.text("Laporan Penjualan Umum Summary Per Hari", 10, 15);
   doc.text(`Tanggal      : ${dayjs(selectedDate).format(dateFormat)}`, 10, 30);

   const columns = [
     "Tanggal",
     "Jumlah (Rp)",
     "Biaya Kirim (Rp)",
     "Sub Total (Rp)",
   ];

   let totalJumlah = 0;
   let totalBiayaKirim = 0;
   let totalSubTotal = 0;

   const bodyData = data
     .filter((item) => item.date === selectedDate)
     .map((item) => {
       const subtotal = item.total + item.delivery_fee;
       totalJumlah += item.total;
       totalBiayaKirim += item.delivery_fee;
       totalSubTotal += subtotal;

       const totalFormatted = new Intl.NumberFormat("id-ID", {
         style: "decimal",
         minimumFractionDigits: 0, 
       }).format(item.total);
       const deliveryFee = new Intl.NumberFormat("id-ID", {
         style: "decimal",
         minimumFractionDigits: 0, 
       }).format(item.delivery_fee);
       const subtotalFormatted = new Intl.NumberFormat("id-ID", {
         style: "decimal",
         minimumFractionDigits: 0, 
       }).format(subtotal);

       return [
         dayjs(item.date).format(dateFormat),
         { content: totalFormatted, styles: { halign: "right" } },
         { content: deliveryFee, styles: { halign: "right" } },
         { content: subtotalFormatted, styles: { halign: "right" } },
       ];
     });

   doc.autoTable({
     startY: 40,
     head: [columns],
     body: bodyData,
     styles: {
       halign: "right",
     },
   });

   const totalFormatted = new Intl.NumberFormat("id-ID", {
     style: "decimal",
     minimumFractionDigits: 0,
   }).format(totalJumlah);
   const deliveryFee = new Intl.NumberFormat("id-ID", {
     style: "decimal",
     minimumFractionDigits: 0,
   }).format(totalBiayaKirim);
   const subtotalFormatted = new Intl.NumberFormat("id-ID", {
     style: "decimal",
     minimumFractionDigits: 0,
   }).format(totalSubTotal);

   doc.autoTable({
     startY: doc.autoTable.previous.finalY + 1,
     body: [["Total", totalFormatted, deliveryFee, subtotalFormatted]],
     showHead: "never",
     showFoot: "never",
     styles: {
       columnWidth: "wrap",
       halign: "right",
     },
   });

   doc.save(
     `transaksi_penjualan_per_${dayjs(selectedDate).format(dateFormat)}.pdf`
   );
 };


  return (
    <div>
      <Navbar />
      <div className="bg-white rounded-lg shadow-lg p-5 mt-10">
        <div className="flex flex-row justify-between mb-5">
          <div className="text-sm font-medium">Laporan Penjualan</div>
          <div className="flex items-end">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <div className="text-sm">Tanggal</div>
                <div className="flex flex-row">
                  <div className="text-sm items-center justify-center text-center">
                    <DatePicker
                      selectsRange={true}
                      startDate={dateRange[0]}
                      endDate={dateRange[1]}
                      onChange={(update) => {
                        if (Array.isArray(update)) {
                          setDateRange(update);
                        }
                      }}
                      isClearable={true}
                      placeholderText="Mulai - Berakhir"
                      dateFormat={dateFormat}
                    />
                  </div>
                  <button className="bg-cyan-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs flex items-center">
                    <PiExportBold /> Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table className="table-auto w-full hover:table-fixed">
          <thead className="bg-gray-500 text-white text-left text-sm w-full">
            <tr>
              <th className="w-[33%] py-3 text-center border">
                Nota Penjualan
              </th>
              <th className="w-[33%] py-3 text-center border">Customer</th>
              <th className="w-[33%] py-3 text-center border">Total (RP)</th>
            </tr>
          </thead>
          <tbody className="border">
            {Array.from(uniqueDates)
              .sort()
              .map((date, index) => (
                <React.Fragment key={index}>
                  <tr className="border">
                    <div className="flex flex-row">
                      <div
                        className="cursor-pointer flex items-center space-x-0"
                        onClick={() => toggleItemVisibility(date)}
                      >
                        <span className="px-4">
                          <AiOutlineCaretDown />
                        </span>
                      </div>
                      {dayjs(date).format("DD MMMM YYYY")}
                      <button
                        className="px-5 flex items-center text-cyan-800"
                        onClick={() => generatePDF(date)}
                      >
                        <PiExportBold />
                      </button>
                    </div>
                  </tr>
                  {data.map((item) => {
                    if (item.date === date && !hiddenItems[date]) {
                      return (
                        <tr key={item.id} className="border">
                          <td className="w-[33%] px-12">{item.sale_code}</td>
                          <td className="w-[33%] text-left px-2">
                            {item.customer.name}
                          </td>
                          <td className="w-[33%] text-right">{item.total}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
