import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Frontend components", () => {
  it("renders a simple component", () => {
    const Simple = () => <div data-testid="hello">Hello</div>;
    render(<Simple />);
    expect(screen.getByTestId("hello")).toHaveTextContent("Hello");
  });
});
