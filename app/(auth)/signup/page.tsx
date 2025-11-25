import Image from "next/image";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#F5F7FA]">
      <div className="form-container flex p-3 min-w-[900px] max-w-[1500px] rounded-2xl shadow-lg items-center justify-center bg-white border border-[#D5DDE5]">
        <form action="" className="p-8">
          <div>
            <h1 className="text-3xl my-1 text-[#2A3036]">Create your account</h1>
            <p className="ms-1 text-[#7C8A96]">
              create an account to use this system
            </p>
          </div>
          <div className="inputs-container my-6 space-y-4">
            <div className="input-group flex flex-col">
              <label htmlFor="username" className="text-xl text-[#2A3036]">
                Username
              </label>
              <input 
                type="text" 
                id="username"
                className="border border-[#D5DDE5] p-3 w-[300px] rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors" 
              />
            </div>
            <div className="input-group flex flex-col">
              <label htmlFor="email" className="text-xl text-[#2A3036]">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                className="border border-[#D5DDE5] p-3 w-[300px] rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors" 
              />
            </div>
            <div className="input-group flex flex-col">
              <label htmlFor="password" className="text-xl text-[#2A3036]">
                Password
              </label>
              <input 
                type="password" 
                id="password"
                className="border border-[#D5DDE5] p-3 w-[300px] rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors" 
              />
            </div>
            <Link 
              href={"/"} 
              className="text-[12px] text-[#62778C] hover:text-[#3A4A5A] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <button className="rounded-lg bg-[#3A4A5A] hover:bg-[#31414F] w-full text-white py-3 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:ring-offset-2">
            Sign Up
          </button>
        </form>
        <div className="image-container w-[50%] min-h-[600px] max-h-[1200px] relative">
          <Image
            src={"/assets/authImage.jpg"}
            alt="auth image"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}