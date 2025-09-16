import { Carousel, CarouselContent, CarouselItem } from "../../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { shortenString } from "@/libs/utils";
import HealthRate from "./healthy-review";
import TasteRate from "./taste-rate";
import { useRef } from "react";
import CommentDetailsCard from "./comment-details-card";

const comments = [
  {
    user: "user first",
    comment:
      "This meal is amazing! The food is delicious and the ambiance is perfect.",
    healthRate: 3,
    tasteRate: 5,
  },
  {
    user: "user name",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa, illum!",
    healthRate: 1,
    tasteRate: 3,
  },
  {
    user: "user second",
    comment:
      "This meal is amazing! The food is delicious and the ambiance is perfect.",
    healthRate: 5,
    tasteRate: 5,
  },
  {
    user: "user test",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium sed soluta adipisci doloremque tenetur fuga temporibus mollitia eum, eligendi repudiandae similique obcaecati eos cupiditate necessitatibus dignissimos. Dolores autem quidem a.",
    healthRate: 2,
    tasteRate: 0,
  },
];

const MealReviewComponents = () => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  return (
    <div>
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 !py-3">
          {comments.map((comment, index) => (
            <CarouselItem key={index} className="basis-5/6 pl-2">
              <CommentDetailsCard comment={comment} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* <button className="w-full">More...</button> */}
    </div>
  );
};

export default MealReviewComponents;
