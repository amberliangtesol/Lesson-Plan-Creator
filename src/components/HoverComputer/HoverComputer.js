import styled, { createGlobalStyle } from "styled-components";
import macbookbottom from "./macbookbottom.png";
import macbookcover from "./macbookcover.png";
import macbooktop from "./macbooktop.png";
import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";


  const HoverComputer = () => {
    const [isOpened, setIsOpened] = useState(false);
    const videoRef = useRef(null);
    const { ref, inView } = useInView({ threshold: 0.5 });

    const handleIntersection = (entries) => {
      if (entries[0].isIntersecting) {
        setIsOpened(true);
      }
    };
  
    useEffect(() => {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      };
  
      const observer = new IntersectionObserver(handleIntersection, options);
      observer.observe(videoRef.current);
  
      return () => {
        observer.disconnect();
      };
    }, []);

  return (
    <Container>
      <div style={{ height: "1000px" }}></div>
      <Mockup className={`mockup mockup-macbook loaded ${isOpened ? "isOpened" : ""}`} ref={ref}>
        <div className="part top">
          <img src={macbooktop} alt="" className="top" />
          <img src={macbookcover} alt="" className="cover" />
          <div ref={videoRef}>
            <video autoPlay controls>
              <source
                src="https://d1xm195wioio0k.cloudfront.net/images/video/support.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
        <div className="part bottom">
          <img src={macbookcover} alt="" className="cover" />
          <img src={macbookbottom} alt="" className="bottom" />
        </div>
      </Mockup>
      <div style={{ height: "1000px" }}></div>
    </Container>
  );
};

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 20px;
  }
`;

const Container = styled.div`
  text-align: center;
`;

const Mockup = styled.div`
  display: inline-block;
  position: relative;
  z-index: 3;
  text-align: center;
  font-size: 0;
  perspective: 2400px;
  perspective-origin: 50% 100%;
  opacity: 0;
  transition: 500ms opacity;

  &.loaded {
    opacity: 1;
  }

  .part .top,
  .part .bottom {
    position: absolute;
    top: 0;
    left: 0;
  }

  .part.top {
    transform: translate3d(0, 0, 0) rotateX(-90deg);
  }

  &:hover .part.top {
    transform: translate3d(0, 0, 0) rotateX(0deg);
  }

  .part {
    display: inline-block;
    position: relative;
    transform-style: preserve-3d;
    transform-origin: 50% 100%;
    transition: 900ms;
  }

  &.opened .part .top {
    transform: translate3d(0, 0, -11px) rotateX(90deg) scale(1, 1);
  }

  .part .top {
    transform-origin: 50% 0;
    transform: translate3d(0, 0, -11px) rotateX(90deg);
    transition: 900ms;
  }

  img {
    display: block;
    max-width: 100%;
    backface-visibility: hidden;
  }

  .part .cover {
    position: relative;
  }

  video {
    display: block;
    position: absolute;
    top: 8%;
    left: 4%;
    width: 92%;
    border-radius: 6px;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 1px);
  }

  .part.bottom {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate3d(0, 0, 0) rotateX(-90deg);
  }

  .part .bottom {
    transform-origin: 50% 0;
    transform: translate3d(0, 0, 0) rotateX(90deg);
  }
`;

export default HoverComputer;