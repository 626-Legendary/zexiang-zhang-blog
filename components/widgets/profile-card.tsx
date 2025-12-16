import { FaLinkedin } from "react-icons/fa";
import { FaRss } from "react-icons/fa";
import { Card } from "../ui/card";
import { FaLocationDot } from "react-icons/fa6";
import Image from "next/image";
export function ProfileCard() {
    return (
        <div className="mb-4 w-full h-fit p-2 border">
            
            <Image
                src="/avatar.jpg"
                alt="avatar"
                width={100}
                height={100}
                className="mx-auto my-8 w-24 h-24 rounded-full object-cover"
            />

            <div className="font-bold text-xl text-center my-2">
                ZEXIANG ZHANG
            </div>
            <div className="text-center text-sm my-2">
                坚持不自律，本身也是一种自律。
            </div>
            <div className="flex justify-center items-center text-xs mt-16">
                <FaLocationDot/> &nbsp;Los Angeles Metropolitan Area
            </div>
            <div className="flex justify-center gap-4 my-4">
                <FaLinkedin />
                <FaRss />
            </div>
        </div>
    )
}