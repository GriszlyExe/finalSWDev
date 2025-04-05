import GoogleButton from 'react-google-button'
import './App.css'

function navigate (url) {
  window.location.href = url;
}

async function auth () {
  const response = await fetch ('http://localhost:10000/api/v1/request', {method: 'post'});
  const data = await response.json();
  console.log(data)
  navigate(data.url);

}

function App() {
  return (
    <>
      <h1>Welcome to Restaurant Reservation</h1>
      <GoogleButton onClick={auth} type='light'></GoogleButton>
    </>
  )
}

export default App