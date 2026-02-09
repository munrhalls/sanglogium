import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HeroCommercials from "../../../../archived/hero-commercials/HeroCommercials";
import { GET_COMMERCIALS_BY_FEATURE_QUERYResult } from "@/sanity.types";
type Commercial = GET_COMMERCIALS_BY_FEATURE_QUERYResult[number];
jest.mock("../../../../ui/carousel-single-slide/carouselSingleSlide", () => {
  return function MockCarouselSingleSlide({ prebuiltSlides, keys }: any) {
    return (
      <div data-testid="carousel-single-slide">
        <div data-testid="carousel-keys">{keys?.join(",")}</div>
        <div data-testid="carousel-slides">{prebuiltSlides}</div>
      </div>
    );
  };
});
jest.mock("../HeroCommercialItem", () => {
  return function MockHeroCommercialItem({ commercial, index }: any) {
    return (
      <div data-testid={`hero-commercial-item-${index}`}>
        <span data-testid="commercial-title">{commercial?.title}</span>
        <span data-testid="commercial-image">{commercial?.image}</span>
      </div>
    );
  };
});
describe("HeroCommercials", () => {
  test("should render commercials correctly with valid data", () => {
    const mockCommercials: Commercial[] = [
      {
        _id: "1",
        title: "Hero Ad",
        image: "url",
        variant: "primary",
        displayOrder: 1,
        text: null,
        ctaLink: null,
        products: [],
        sale: null,
      } as Commercial,
    ];
    render(<HeroCommercials commercials={mockCommercials} />);
    expect(screen.getByTestId("carousel-single-slide")).toBeInTheDocument();
    expect(screen.getByTestId("commercial-title")).toHaveTextContent("Hero Ad");
    expect(screen.getByTestId("commercial-image")).toHaveTextContent("url");
    expect(screen.getByTestId("carousel-keys")).toHaveTextContent("1");
    expect(screen.getByTestId("hero-commercial-item-0")).toBeInTheDocument();
  });
  test("should render fallback message when commercials array is empty", () => {
    render(<HeroCommercials commercials={[]} />);
    expect(screen.getByText("No commercials available")).toBeInTheDocument();
    expect(
      screen.queryByTestId("carousel-single-slide")
    ).not.toBeInTheDocument();
  });
  test("should have commercials prop typed as Commercial[]", () => {
    const validCommercials: Commercial[] = [
      {
        _id: "test-1",
        title: "Test Commercial",
        image: "test-url",
      } as Commercial,
    ];
    const { container } = render(
      <HeroCommercials commercials={validCommercials} />
    );
    expect(container).toBeTruthy();
  });
  test("should handle null or undefined commercials gracefully", () => {
    render(<HeroCommercials commercials={undefined as any} />);
    expect(screen.getByText("No commercials available")).toBeInTheDocument();
    screen.getByText("No commercials available").remove();
    render(<HeroCommercials commercials={null as any} />);
    expect(screen.getByText("No commercials available")).toBeInTheDocument();
  });
  test("should render multiple commercials correctly", () => {
    const mockCommercials: Commercial[] = [
      {
        _id: "1",
        title: "First Ad",
        image: "url1",
      } as Commercial,
      {
        _id: "2",
        title: "Second Ad",
        image: "url2",
      } as Commercial,
      {
        _id: "3",
        title: "Third Ad",
        image: "url3",
      } as Commercial,
    ];
    render(<HeroCommercials commercials={mockCommercials} />);
    expect(screen.getByTestId("hero-commercial-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("hero-commercial-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("hero-commercial-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-keys")).toHaveTextContent("1,2,3");
  });
});
