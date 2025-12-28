import { Route, Routes } from 'react-router-dom'
import { MainPage } from './page/main/main';
import { PrivacyPolicy } from './page/privacy-policy/privacy-policy';
import { LoginAdmin } from './page/admin/auth/login/login';
import { RegisterAdmin } from './page/admin/auth/register/register';
import { LoginTeacher } from './page/teacher/auth/login/login';
import { RegisterTeacher } from './page/teacher/auth/register/register';
import { MainStudent } from './page/student/main';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        {/* ADMIN */}
        <Route path='/admin'>
          <Route index element={<LoginAdmin />} />
          <Route path='register' element={<RegisterAdmin />} />
        </Route>

        {/* TEACHER */}
        <Route path='/teacher' >
          <Route index element={<LoginTeacher />} />
          <Route path='/register' element={<RegisterTeacher />} />
        </Route>

        {/* STUDENT */}
        <Route path='/student'>
          <Route index element={<MainStudent />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
