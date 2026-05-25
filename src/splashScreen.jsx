import { useEffect } from "react";

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <img src="/logoOficial.png" alt="Logo" style={styles.logo} />
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundColor: "#000", 
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: "150px"
  }
};

export default SplashScreen;