import { Route, Routes } from 'react-router-dom'
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/privacy-policy/privacy-policy';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      </Routes>
    </>
  )
}

export default App
