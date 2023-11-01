import Link from 'next/link'
import React from 'react'
import { IoIosArrowDown } from "react-icons/io"

const Navbar = () => {
  return (
    <>
    <div className='flex bg-white shadow-sm py-3 px-5'>
      <ul className='container mx-auto h-16 flex justify-end items-center'>
        <Link href='/pages/dashboard' className='mr-5 text-sm px-3'>Dashboard</Link>
        <li className='mr-5 text-sm flex justify-center items-center'>Master<div className="px-3"><IoIosArrowDown/></div></li>
        <li className='mr-5 text-sm flex justify-center items-center'>Pembelian<div className="px-3"><IoIosArrowDown/></div></li>
        <li className='mr-5 text-sm flex justify-center items-center'>Konsinyasi<div className="px-3"><IoIosArrowDown/></div></li>
        <li className='mr-5 text-sm flex justify-center items-center'>Laporan<div className="px-3"><IoIosArrowDown/></div></li>
        <li className='mr-5 text-sm flex justify-center items-center'>Informasi<div className="px-3"><IoIosArrowDown/></div></li>
      </ul>
    </div>
    </>
  )
}

export default Navbar