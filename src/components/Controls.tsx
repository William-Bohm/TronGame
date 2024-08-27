import styled    from "styled-components";
import GameSpeedSlider from "./ControllerComponents/GameSpeedSlider";
import BoardSizeSelector from "./ControllerComponents/BoardSizeSelector";

const Controls: React.FC = () => {

    return <div>
        <GameSpeedSlider/>
        <div style={{height: 10}}></div>
        <BoardSizeSelector/>
    </div>
};

export default Controls;
