import { Button, Input, Checkbox } from '@nextui-org/react';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';

import { GoogleSignInIcon, GoogleSignUpIcon } from '@/components/icons';
import DefaultLayout from '@/layouts/default';

interface FormData {
  given_name: string;
  family_name: string;
  email: string;
  password: string;
  terms: boolean;
}

interface FormErrors {
  given_name?: string;
  family_name?: string;
  email?: string;
  password?: string;
  terms?: string;
}

const initialFormData: FormData = {
  given_name: '',
  family_name: '',
  email: '',
  password: '',
  terms: false,
};

export default function Authentication() {
  const routeTo = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!isLogin) {
      if (!formData.given_name.trim()) {
        newErrors.given_name = 'Given name is required';
        isValid = false;
      } else if (formData.given_name.trim().length < 2) {
        newErrors.given_name = 'Given name must be at least 2 characters long';
        isValid = false;
      }

      if (!formData.family_name.trim()) {
        newErrors.family_name = 'Family name is required';
        isValid = false;
      } else if (formData.family_name.trim().length < 2) {
        newErrors.family_name =
          'Family name must be at least 2 characters long';
        isValid = false;
      }

      if (!formData.terms) {
        newErrors.terms = 'You must agree to the terms and conditions';
        isValid = false;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const endpoint = isLogin ? 'login' : 'register';

        const res = await axios.post(
          `http://localhost:3500/${endpoint}`,
          formData
        );
        handleAuthResponse(res.data);
      } catch (error: any) {
        toast.error(error.response?.data?.errorMessage || 'An error occurred');
      }
    }
  };
  const register = async (tokenResponse: TokenResponse) => {
    try {
      await handleGoogleAuth(tokenResponse.access_token, 'register');
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (tokenResponse: TokenResponse) => {
    try {
      await handleGoogleAuth(tokenResponse.access_token, 'login');
    } catch (error) {
      console.log(error);
    }
  };

  const GoogleSignUp = useGoogleLogin({ onSuccess: register });
  const GoogleSignIn = useGoogleLogin({ onSuccess: login });

  async function handleGoogleAuth(
    accessToken: string | undefined,
    action: 'register' | 'login'
  ): Promise<void> {
    if (!accessToken) return;
    try {
      const res = await axios.post(`http://localhost:3500/${action}`, {
        googleAccessToken: accessToken,
      });
      handleAuthResponse(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.errorMessage || 'An error occurred');
    }
  }

  function handleAuthResponse(data: any) {
    const userCheck: string = data.user.verificationToken;
    if (userCheck === 'google' || userCheck === 'email') {
      const expirationTime = new Date().getTime() + 3600000;
      localStorage.setItem('authResponse', JSON.stringify(data));
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenExpiration', expirationTime.toString());
      const user: string = data.user.userType;

      if (user === 'default') {
        routeTo(data.user.profileStatus ? '/createProfile' : '/createProfile');
      } else if (user === 'patient') {
        routeTo(
          data.user.profileStatus ? '/patientDashboard' : '/createProfile'
        );
      } else if (user === 'researcher') {
        routeTo(
          data.user.profileStatus ? '/researcherDashboard' : '/createProfile'
        );
      } else if (user === 'admin') {
        routeTo(data.user.profileStatus ? '/admin' : '/admin');
      }
    } else {
      toast.success('please verify email and login');
      setIsLogin(true);
      setFormData(initialFormData);
    }
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <Input
                  isRequired
                  errorMessage={errors.given_name}
                  isInvalid={!!errors.given_name}
                  label="Given Name"
                  name="given_name"
                  value={formData.given_name}
                  onChange={handleInputChange}
                />
                <Input
                  isRequired
                  errorMessage={errors.family_name}
                  isInvalid={!!errors.family_name}
                  label="Family Name"
                  name="family_name"
                  value={formData.family_name}
                  onChange={handleInputChange}
                />
              </>
            )}
            <Input
              isRequired
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              isRequired
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {!isLogin && (
              <>
                <Checkbox
                  isSelected={formData.terms}
                  name="terms"
                  onValueChange={(checked) => {
                    setFormData((prev) => ({ ...prev, terms: checked }));
                    setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                >
                  I agree to the terms and conditions
                </Checkbox>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms}</p>
                )}
              </>
            )}
            <Button className="w-full" type="submit">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <Button className="w-full" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Switch to Sign Up' : 'Switch to Sign In'}
          </Button>
          <div className="w-full border-t border-gray-300 my-4" />
          <Button
            className="w-full"
            onClick={() => (isLogin ? GoogleSignIn() : GoogleSignUp())}
          >
            {isLogin ? (
              <>
                <GoogleSignInIcon /> Sign In with Google
              </>
            ) : (
              <>
                <GoogleSignUpIcon /> Sign Up with Google
              </>
            )}
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
