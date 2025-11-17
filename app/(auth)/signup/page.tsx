import Image from "next/image";
import Link from "next/link";
export default function SignUp() {
  return (
    <div className="border-red-600 w-screen h-screen flex justify-center items-center">
      <div className="form-container flex  p-3 min-w-[900px] max-w-[1500px] rounded-2xl shadow-2xl items-center justify-center">
        <form action="" className="p-8">
          <div>
            <h1 className="text-3xl my-1">Create your account</h1>
            <p className="ms-1 text-gray-500">
              create an account to use this system
            </p>
          </div>
          <div className="inputs-container my-6">
            <div className="input-group flex flex-col">
              <label htmlFor="email" className="text-xl">
                Username
              </label>
              <input type="email" className="border p-1 w-[300px] rounded" />
            </div>
            <div className="input-group flex flex-col">
              <label htmlFor="email" className="text-xl">
                Email
              </label>
              <input type="email" className="border p-1 w-[300px] rounded" />
            </div>
            <div className="input-group flex flex-col">
              <label htmlFor="password" className="text-xl">
                Password
              </label>
              <input type="password" className="border p-1 w-[300px] rounded" />
            </div>
            <Link href={"/"} className="text-[12px] text-blue-500">
              forgot password
            </Link>
          </div>
          <div></div>
          <button className="rounded bg-purple-500 w-full text-white py-1">
            Sign Up
          </button>
        </form>
        <div className="image-container w-[50%] min-h-[600px] max-h-[1200px] relative">
          <Image
            src={"/assets/authImage.jpg"}
            alt="auth image"
            fill
            className="object-contain"
          ></Image>
        </div>
      </div>
    </div>
  );
}
