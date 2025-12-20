import logos from '../../assets/img/logo.png'
import img from '../../assets/img/insurance.png'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
export const MainPage = () => {
    return (
        <div>
            <div className="h-screen shadow-2xl flex justify-center items-center ">
                <div className="p-10 flex flex-col shadow-2xl rounded-3xl  justify-center items-center text-center">
                    <div className='w-50'><img src={logos} alt='logo' /></div>
                    <h3 className='flex md:text-4xl font-bold  text-gray-900 mt-10'>Online Full-stack course</h3>
                    <p className='text-lg text-gray-600 mt-2'>Xush kelibsiz!</p>
                    <p className="text-base text-gray-500 max-w-md">
                        Agar platformamizdan  <a
                            href="https://t.me/online_course_7390_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-500 hover:underline"
                        >
                            Talaba
                        </a>{" "} sifatida foydalanmoqchi bo'lsangiz Telegram botga oting
                    </p>
                    <a
                        href="https://t.me/online_course_7390_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                    >                        <button
                        className="flex items-center my-8 justify-center gap-2 w-full max-w-md px-6 h-14 text-lg font-semibold text-white 
                                bg-linear-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 
                                rounded-md shadow-lg hover:shadow-xl transition-all duration-300 
                                disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            </svg>
                            Telegram Bot'ga o'tish
                        </button>
                    </a>
                    <div className='flex justify-center gap-12 items-center w-full px-10 pb-5'>
                        <Link to="/admin">
                            <Button
                                style={{
                                    background: 'linear-gradient(to right, #cc2a2a, #e9de4a)',
                                    color: 'white',
                                    height: '44px',
                                    padding: '0 30px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease', 
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 6px 10px rgba(204, 42, 42, 0.5)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)')
                                }
                            >
                                ADMIN
                            </Button>
                        </Link>

                        <Link to="/teacher">
                            <Button
                                style={{
                                    background: 'linear-gradient(to right, #4dd454, #14b8a6)',
                                    color: 'white',
                                    height: '44px',
                                    padding: '0 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    paddingLeft: '27px',
                                    paddingRight: '27px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease', 
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 6px 10px rgba(43, 177, 41, 0.822)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)')
                                }
                            >
                                TEACHER
                            </Button>
                        </Link>

                    </div>
                    <p className="text-[14px] w-112.5 text-gray-600 mt-2">Bot orqali darslarni ko'rishingiz, band qilishingiz va boshqarishingiz mumkin</p>
                    <div className="pt-4 border-t border-gray-200 w-full mt-5"></div>
                    <div className='flex gap-3 items-center'>
                        <div className='w-5'>
                            <img src={img} alt="" />
                        </div>
                        <Link to={'/privacy-policy  '}><p className='text-blue-700 text-[14px] hover:underline cursor-pointer text- hover:border-blue-500 transition-all duration-300'>Maxfiylik Siyosati</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
