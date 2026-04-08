import { test, expect } from '@playwright/experimental-ct-react';
import { Carousel } from '../../../app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '../../../app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '../../../app/components/layout/carousel/CarouselSlide';
import { CarouselPrevious, CarouselNext, CarouselDots } from '../../../app/components/layout/carousel/CarouselControls';

const mockBreakpointMap = {
  xl: 3,
  lgDesktop: 3,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1
};

const createMockSlides = (count: number) => {
  return Array.from({ length: count }, (_, i) => (
    <CarouselSlide key={i} className="flex h-full flex-col px-3">
      <div data-testid={`slide-${i}`} className="w-full h-20 bg-gray-200 flex items-center justify-center">
        Slide {i + 1}
      </div>
    </CarouselSlide>
  ));
};

test.describe('Carousel Integration Tests', () => {
  test('renders carousel with correct initial state', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    // Check carousel renders
    const carousel = page.locator('section[aria-roledescription="carousel"]');
    await expect(carousel).toBeVisible();

    // Check all slides are present
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`[data-testid="slide-${i}"]`)).toBeVisible();
    }

    // Check first slide is active
    const firstSlide = page.locator('[data-testid="slide-0"]');
    await expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  test('next button advances carousel', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const nextBtn = page.locator('button[aria-label="Next slide"]');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeEnabled();

    // Click next button
    await nextBtn.click();

    // Check second slide is now active
    const secondSlide = page.locator('[data-testid="slide-1"]');
    await expect(secondSlide).toHaveAttribute('data-active', 'true');

    // Check first slide is no longer active
    const firstSlide = page.locator('[data-testid="slide-0"]');
    await expect(firstSlide).not.toHaveAttribute('data-active', 'true');
  });

  test('prev button retreats carousel', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const nextBtn = page.locator('button[aria-label="Next slide"]');
    const prevBtn = page.locator('button[aria-label="Previous slide"]');

    // Advance to second slide
    await nextBtn.click();
    await expect(page.locator('[data-testid="slide-1"]')).toHaveAttribute('data-active', 'true');

    // Click prev button
    await prevBtn.click();

    // Check first slide is active again
    const firstSlide = page.locator('[data-testid="slide-0"]');
    await expect(firstSlide).toHaveAttribute('data-active', 'true');
  });

  test('dots navigate directly to slides', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    // Click third dot (index 2)
    const dots = page.locator('[data-testid="carousel-dot"]');
    await expect(dots).toHaveCount(5);
    
    await dots.nth(2).click();

    // Check third slide is active
    const thirdSlide = page.locator('[data-testid="slide-2"]');
    await expect(thirdSlide).toHaveAttribute('data-active', 'true');

    // Check corresponding dot is active
    await expect(dots.nth(2)).toHaveAttribute('data-active', 'true');
  });

  test('prev button disabled at first slide', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const prevBtn = page.locator('button[aria-label="Previous slide"]');
    
    // At first slide, prev should be disabled
    await expect(prevBtn).toBeDisabled();
  });

  test('next button disabled at last slide', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const nextBtn = page.locator('button[aria-label="Next slide"]');
    
    // Navigate to last possible position
    for (let i = 0; i < 4; i++) {
      await nextBtn.click();
    }

    // Next button should be disabled
    await expect(nextBtn).toBeDisabled();
  });

  test('visible count CSS variable is applied', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    // Check CSS variable is set
    const carouselContainer = page.locator('div[style*="--visible-count"]');
    await expect(carouselContainer).toBeVisible();
    
    // Get the CSS variable value
    const visibleCount = await carouselContainer.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--visible-count');
    });
    
    expect(visibleCount).toBe('1'); // Default mobile portrait
  });

  test('handles zero items gracefully', async ({ mount }) => {
    const component = await mount(
      <Carousel itemsCount={0} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(0)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    // Component should render null
    expect(component).toBeNull();
  });

  test('handles single item carousel', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={1} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(1)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const prevBtn = page.locator('button[aria-label="Previous slide"]');
    const nextBtn = page.locator('button[aria-label="Next slide"]');
    
    // Both buttons should be disabled with single item
    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeDisabled();

    // Should have single dot
    const dots = page.locator('[data-testid="carousel-dot"]');
    await expect(dots).toHaveCount(1);
  });

  test('active slide updates correctly on rapid navigation', async ({ mount }) => {
    await mount(
      <Carousel itemsCount={5} breakpointMap={mockBreakpointMap}>
        <CarouselTrack className="w-full items-stretch mx-0">
          {createMockSlides(5)}
        </CarouselTrack>
        <div className="flex gap-4">
          <CarouselPrevious />
          <CarouselDots />
          <CarouselNext />
        </div>
      </Carousel>
    );

    const nextBtn = page.locator('button[aria-label="Next slide"]');
    const dots = page.locator('[data-testid="carousel-dot"]');

    // Rapid navigation
    await nextBtn.click(); // Slide 1
    await nextBtn.click(); // Slide 2
    await dots.nth(0).click(); // Back to Slide 0
    await nextBtn.click(); // Slide 1

    // Should end up on slide 1
    await expect(page.locator('[data-testid="slide-1"]')).toHaveAttribute('data-active', 'true');
    await expect(dots.nth(1)).toHaveAttribute('data-active', 'true');
  });
});
