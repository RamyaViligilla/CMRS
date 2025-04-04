import { Link } from '@nextui-org/link';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/navbar';
import { link as linkStyles } from '@nextui-org/theme';
import clsx from 'clsx';
import { Button } from '@nextui-org/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';
export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let navMenuItems;
  const userInfoString = localStorage.getItem('user');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const logout = () => {
    localStorage.removeItem('authResponse');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    navigate('/authentication');
  };

  useEffect(() => {
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    if (tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration, 10);
      const currentTime = new Date().getTime();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration > 0) {
        const timer = setTimeout(() => {
          logout();
        }, timeUntilExpiration);

        return () => {
          clearTimeout(timer);
        };
      } else {
        logout();
      }
    }
  }, [logout]);

  if (userInfo === null) {
    navMenuItems = siteConfig.navMenuItemsDefault;
  } else if (userInfo.userType === 'patient') {
    navMenuItems = siteConfig.navMenuItemsPatient;
  } else if (userInfo.userType === 'researcher') {
    navMenuItems = siteConfig.navMenuItemsResearcher;
  } else if (userInfo.userType === 'admin') {
    navMenuItems = siteConfig.navMenuItemsAdmin;
  }

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit"> 🧬 CRMT</p>
          </Link>
        </NavbarBrand>
        <div className="hidden md:flex gap-4 justify-start ml-2">
          {navMenuItems &&
            navMenuItems.map((item) => (
              <NavbarItem key={item.href}>
                <Link
                  className={clsx(
                    linkStyles({ color: 'foreground' }),
                    'data-[active=true]:text-primary data-[active=true]:font-medium',
                    location.pathname === item.href &&
                      'text-purple-600 font-medium'
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden md:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          {userInfo && (
            <>
              <Button color="default" variant="shadow" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="md:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {navMenuItems &&
            navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    location.pathname === item.href
                      ? 'primary'
                      : index === navMenuItems.length - 1
                        ? 'danger'
                        : 'foreground'
                  }
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
        </div>
        {userInfo && (
          <>
            <Button color="default" variant="shadow" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </NavbarMenu>
    </NextUINavbar>
  );
};
