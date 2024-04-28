import PlayButtons from "../PlayButtons"
import Navbar from "../Navbar"

const ControlPanel = ({ player, is_paused, currentScreen, setCurrentScreen }) => {
  return (
    <>
      <PlayButtons 
        player={player} 
        is_paused={is_paused} 
      />
      <Navbar 
        currentScreen={currentScreen} 
        setCurrentScreen={setCurrentScreen} 
      />
    </>
  )
}

export default ControlPanel
