import { fireEvent, render, screen } from "@testing-library/react";
import BackButton from "./backButton";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: () => "/list",
}));

describe("BackButton", () => {
  it("renders back button and calls router.back on click", () => {
    const mockBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });

    render(<BackButton />);

    const button = screen.getByRole("button", { name: /go back/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockBack).toHaveBeenCalled();
  });
});
