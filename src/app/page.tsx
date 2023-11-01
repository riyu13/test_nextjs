'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SalesData {
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
  const dateFormat = "dd/MM/yyyy";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedStartDate = dateRange[0]
          ? dayjs(dateRange[0]).format("YYYY-MM-DD")
          : "";
        const formattedEndDate = dateRange[1]
          ? dayjs(dateRange[1]).format("YYYY-MM-DD")
          : "";

        const response = await axios.get(
          `https://4771d15e-8011-4829-bafb-87c538aacc11.mock.pstmn.io/api/v0/sales/sales/list?order=ASC&page=1&take=150&start_date=${formattedStartDate}&finish_date=${formattedEndDate}`
        );
        setData(response.data.data);

        const uniqueDatesSet = new Set(
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

  return (
    <div>
      <Navbar />
      <div className="bg-white rounded-lg shadow-lg p-5 mt-10">
        <div className="flex flex-row justify-between mb-5">
          <div className="text-sm">Laporan Penjualan</div>
          <div className="w-1/6">
            <div className="flex flex-col">
              <div className="text-sm">Tanggal</div>
              <div className="flex flex-row">
                <div className="relative flex-1 text-sm">
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
                    placeholderText="Tanggal Mulai - Tanggal Berakhir"
                    dateFormat={dateFormat}
                  />
                </div>
                <button className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs flex items-center">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
        <table className="table-auto w-full border">
          <thead className="bg-gray-600 text-white text-left text-sm w-full">
            <tr>
              <tr>
                <th className="w-[33%] px-4 py-3">Nota Penjualan</th>
                <th className="w-[33%] px-32 py-3">Customer</th>
                <th className="w-[33%] px-56 py-3">Total (RP)</th>
              </tr>
            </tr>
          </thead>
          <tbody>
            {Array.from(uniqueDates)
              .sort()
              .map((date, index) => (
                <React.Fragment key={index}>
                  <ul
                    className="cursor-pointer"
                    onClick={() => toggleItemVisibility(date)}
                  >
                    {date}
                    <ul>
                      {data.map((item) => {
                        if (item.date === date && !hiddenItems[date]) {
                          return (
                            <tr key={item.id}>
                              <td className="w-[33%] px-4 py-2">
                                {item.sale_code}
                              </td>
                              <td className="w-[33%] px-32 py-2">
                                {item.customer.name}
                              </td>
                              <td className="w-[33%] px-56 py-2">
                                {item.total}
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </ul>
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
