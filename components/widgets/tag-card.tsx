import { FaTags } from "react-icons/fa";
import { Card } from "../ui/card";
export function TagCard() {
    return (
        <Card className="w-full h-fit p-2">

            <div className="flex items-center">
                <FaTags />
                &nbsp;标签
            </div>
        </Card>
    )
}