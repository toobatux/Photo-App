import { useState } from "react";
import { Link } from "react-router";
import { customFetch } from "../../../services/api";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await customFetch('/api/signup/', {
        method: "POST",
        body: JSON.stringify({
          name: name,
          username: username,
          email: email,
          password: password
        })
      })
    } catch (error) {
      console.log("error creating account:", error);
    }
  }

  return (
    <div className="flex w-full bg-background p-8 rounded-lg shadow lg:shadow-none overflow-auto">
      <div className="flex flex-col w-full gap-4">
      <h1 className={`text-2xl md:text-3xl font-medium mb-4 lobster-regular`}>
        Create an account
      </h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          {/* <label htmlFor="name">Name</label> */}
          <input
            type="name"
            id="name"
            value={name}
            onChange={(e) => {setName(e.target.value)}}
            className={`input-box`}
            placeholder="Name"
            required
            // {...register("name")}
          />
          {/* {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )} */}
        </div>
        <div className="flex flex-col gap-1">
          {/* <label htmlFor="name">Name</label> */}
          <input
            type="username"
            id="username"
            value={username}
            onChange={(e) => {setUsername(e.target.value)}}
            className={`input-box`}
            placeholder="Username"
            required
            // {...register("name")}
          />
          {/* {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )} */}
        </div>
        <div className="flex flex-col gap-1">
          {/* <label htmlFor="email">Email</label> */}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {setEmail(e.target.value)}}
            className={`input-box`}
            placeholder="Email"
            required
            // {...register("email")}
          />
          {/* {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )} */}
        </div>
        <div className="flex flex-col gap-1">
          <div className="relative">
            <div className="flex flex-col gap-1">
            {/* <label htmlFor="password">Password</label> */}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
              className={`input-box`}
              placeholder="Password"
              required
              // {...register("password")}
            />
            </div>
            <div className="absolute right-1 top-1 bottom-1 flex items-center p-2">
              <button
                type="button"
                className="underline text-black/60 hover:text-black cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )} */}
        </div>
        <div className="flex flex-col gap-1">
          <div className="relative">
            {/* <label htmlFor="password">Confirm password</label> */}
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="password_confirm"
              className={`input-box`}
              value={passwordConfirm}
              onChange={(e) => {setPasswordConfirm(e.target.value)}}
              placeholder="Confirm password"
              required
              // {...register("password_confirm")}
            />
            <div className="absolute right-1 top-1 bottom-1 flex items-center p-2 bg-none backdrop-blur">
              <button
                type="button"
                className="underline text-black/60 hover:text-black cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {/* {errors.password_confirm && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password_confirm.message}
            </p>
          )} */}
        </div>
        <button type="submit" className="btn-primary mt-4">
          Continue
        </button>
      </form>
      <div className="flex gap-1">
        <p>Already have an account?</p>
        <Link to="/login" className="underline">
          Sign in
        </Link>
      </div>
    </div>
    </div>
  )
}

export default SignupForm;