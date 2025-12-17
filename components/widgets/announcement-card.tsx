import { FaBullhorn } from "react-icons/fa";
import { Card } from "../ui/card";

export function AnnouncementCard() {
    return (
        <Card className="w-full h-fit p-2">
            <div className="flex items-center">

                <FaBullhorn />
                &nbsp;公告
            </div>
            <div className="mt-2">
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempore, fugit.</p>
            </div>


        </Card>
    )
}