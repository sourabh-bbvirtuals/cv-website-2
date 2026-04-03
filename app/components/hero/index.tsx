import { BannerSlider } from './banner-slider';
import { MobileBannerSlider } from './mobile-banner-slider';

export default function Hero({
  desktopBanners,
  mobileBanners,
}: {
  desktopBanners: string[];
  mobileBanners: string[];
}) {
  return (
    <>
    {desktopBanners.length > 0 && (
      <main className="hidden md:flex mt-4 flex-col items-center justify-center px-4">
        <BannerSlider desktopBanners={desktopBanners} />
      </main>
      )}
      {mobileBanners.length > 0 && (
      <main className="md:hidden flex flex-col items-center justify-center">
        <MobileBannerSlider mobileBanners={mobileBanners} />
      </main>
      )}
    </>
  );
}
