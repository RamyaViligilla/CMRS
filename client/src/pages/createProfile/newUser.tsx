import React, { useEffect, useState } from 'react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import {
  Select,
  SelectItem,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Radio,
  RadioGroup,
  Textarea,
} from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import { createUserDetails } from '@/helpers/axiosCalls';
import { UserData } from '@/types';
import { specializations } from '@/helpers/commonLogic';

interface NewUserProps {
  userId: string;
  userEmailId: string;
}

export default function NewUser({ userId, userEmailId }: NewUserProps) {
  const [userType, setUserType] = useState<string>('');
  const [formData, setFormData] = useState<UserData>({});
  const [errors, setErrors] = useState<UserData>({});
  const [countryCodes, setCountryCodes] = useState<
    Array<{ code: string; country: string; id: string }>
  >([]);

  useEffect(() => {
    const codes = getCountries().map((country) => ({
      code: `+${getCountryCallingCode(country)}`,
      country:
        new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ||
        country,
      id: `${country}-${getCountryCallingCode(country)}`, // Unique id
    }));

    codes.sort((a, b) => a.country.localeCompare(b.country));

    setCountryCodes(codes);
  }, []);
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setUserType(value);
    setFormData({});
    setErrors({});
  };
  const routeTo = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: UserData = {};
    let isValid = true;

    if (userType === 'researcher') {
      if (!formData.medicalLicenseNumber) {
        newErrors.medicalLicenseNumber = 'Medical License Number is required';
        isValid = false;
      }
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required';
        isValid = false;
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of Birth is required';
        isValid = false;
      }
      if (!formData.countryCode) {
        newErrors.countryCode = 'Country code is required';
        isValid = false;
      }
      if (!formData.contactNumber) {
        newErrors.contactNumber = 'Contact number is required';
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Contact number must be 10 digits';
        isValid = false;
      }
      if (!formData.experience) {
        newErrors.experience = 'Experience is required';
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
        isValid = false;
      }
    } else if (userType === 'patient') {
      if (!formData.medicalHistory) {
        newErrors.medicalHistory = 'Medical History is required';
        isValid = false;
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of Birth is required';
        isValid = false;
      }
      if (!formData.countryCode) {
        newErrors.countryCode = 'Country code is required';
        isValid = false;
      }
      if (!formData.contactNumber) {
        newErrors.contactNumber = 'Contact number is required';
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Contact number must be 10 digits';
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
        isValid = false;
      }
      if (!formData.medicalHistory) {
        newErrors.medicalHistory = 'Medical History is required';
        isValid = false;
      }
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
      const userData = { userType, ...formData, userEmailId, userId };
      try {
        const response = await createUserDetails(userData);
        if (response.data.message === 'User details saved successfully') {
          const savedUserType = response.data.user.userType;
          let user = localStorage.getItem('user');

          if (user) {
            const userObject = JSON.parse(user);
            if (
              userObject &&
              typeof userObject === 'object' &&
              'userType' in userObject &&
              'profileStatus' in userObject
            ) {
              userObject.userType = savedUserType;
              userObject.profileStatus = true;
              const updatedUser = JSON.stringify(userObject);
              localStorage.setItem('user', updatedUser);
            } else {
              console.error('Invalid user object.');
            }
          } else {
            console.error('User data not found in localStorage.');
          }
          if (savedUserType === 'researcher') {
            routeTo('/researcherDashboard');
          } else if (savedUserType === 'patient') {
            routeTo('/patientDashboard');
          }
        }
      } catch (error) {
        console.error('Error Updating user:', error);
      }
    } else {
      console.log('Form has errors');
    }
  };

  return (
    <section className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Select
                className="w-full"
                label="What type of user are you?"
                placeholder="Select user type"
                onChange={handleUserTypeChange}
              >
                <SelectItem key="researcher" value="researcher">
                  Researcher
                </SelectItem>
                <SelectItem key="patient" value="patient">
                  Patient
                </SelectItem>
              </Select>
            </div>

            {userType === 'researcher' && (
              <div className="mb-4">
                <CardHeader>
                  <h2 className="text-xl font-bold">
                    researcher Additional Details
                  </h2>
                </CardHeader>
                <Input
                  className="mb-2"
                  errorMessage={errors.medicalLicenseNumber}
                  isInvalid={!!errors.medicalLicenseNumber}
                  label="Medical License Number"
                  name="medicalLicenseNumber"
                  value={formData.medicalLicenseNumber || ''}
                  onChange={handleInputChange}
                />
                <Select
                  className="mb-2"
                  errorMessage={errors.specialization}
                  isInvalid={!!errors.specialization}
                  label="Specialization"
                  name="specialization"
                  placeholder="Select specialization"
                  selectedKeys={
                    formData.specialization ? [formData.specialization] : []
                  }
                  onChange={(e) =>
                    handleSelectChange(e.target.value, 'specialization')
                  }
                >
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  className="mb-2"
                  errorMessage={errors.age}
                  isInvalid={!!errors.age}
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                />
                <Input
                  className="mb-2"
                  errorMessage={errors.dateOfBirth}
                  isInvalid={!!errors.dateOfBirth}
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={handleInputChange}
                />
                <div className="flex mb-2">
                  <Select
                    className="w-2/3 mr-2"
                    label="Code"
                    name="countryCode"
                    placeholder="Select"
                    selectedKeys={
                      formData.countryCode ? [formData.countryCode] : []
                    }
                    onChange={(e) =>
                      handleSelectChange(e.target.value, 'countryCode')
                    }
                  >
                    {countryCodes.map((country) => (
                      <SelectItem key={country.id} value={country.code}>
                        {`${country.code} (${country.country})`}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    className="w-2/3"
                    label="Contact Number"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>
                {(errors.countryCode || errors.contactNumber) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.countryCode || errors.contactNumber}
                  </p>
                )}
                <Input
                  className="mb-2"
                  errorMessage={errors.experience}
                  isInvalid={!!errors.experience}
                  label="Experience as researcher (years)"
                  name="experience"
                  type="number"
                  value={formData.experience || ''}
                  onChange={handleInputChange}
                />
                <RadioGroup
                  label="Gender"
                  name="gender"
                  orientation="horizontal"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange(value, 'gender')}
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </RadioGroup>
                {errors.gender && (
                  <p className="text-pink-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            )}

            {userType === 'patient' && (
              <div className="mb-4">
                <CardHeader>
                  <h2 className="text-xl font-bold">
                    Patient Additional Details
                  </h2>
                </CardHeader>
                <Input
                  className="mb-2"
                  errorMessage={errors.age}
                  isInvalid={!!errors.age}
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                />
                <Input
                  className="mb-2"
                  errorMessage={errors.dateOfBirth}
                  isInvalid={!!errors.dateOfBirth}
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={handleInputChange}
                />
                <div className="flex mb-2">
                  <Select
                    className="w-1/3 mr-2"
                    label="Code"
                    name="countryCode"
                    placeholder="Select"
                    selectedKeys={
                      formData.countryCode ? [formData.countryCode] : []
                    }
                    onChange={(e) =>
                      handleSelectChange(e.target.value, 'countryCode')
                    }
                  >
                    {countryCodes.map((country) => (
                      <SelectItem key={country.id} value={country.code}>
                        {`${country.code} (${country.country})`}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    className="w-2/3"
                    label="Contact Number"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>
                {(errors.countryCode || errors.contactNumber) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.countryCode || errors.contactNumber}
                  </p>
                )}
                <RadioGroup
                  label="Gender"
                  name="gender"
                  orientation="horizontal"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange(value, 'gender')}
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </RadioGroup>
                {errors.gender && (
                  <p className="text-pink-500 text-sm mt-1">{errors.gender}</p>
                )}
                <Textarea
                  className="mb-2"
                  errorMessage={errors.medicalHistory}
                  isInvalid={!!errors.medicalHistory}
                  label="Medical History"
                  name="medicalHistory"
                  value={formData.medicalHistory || ''}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {userType !== '' && (
              <Button color="danger" type="submit">
                Update Profile
              </Button>
            )}
            {userType === '' && (
              <div className="text-center p-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                  Welcome to Your Profile Setup
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  To get started, please select your user type:
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-lg font-semibold text-purple-600">
                      Researcher
                    </h2>
                    <p className="text-sm text-gray-500">
                      For medical professionals
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-lg font-semibold text-purple-600">
                      Patient
                    </h2>
                    <p className="text-sm text-gray-500">
                      For individuals seeking care
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardBody>
      </Card>
    </section>
  );
}
