import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("UI Primitive: Button", () => {
  it("renders with default variant and children text", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("applies secondary and destructive variants correctly", () => {
    const { rerender } = render(<Button variant="secondary">Secondary Action</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    rerender(<Button variant="destructive">Delete Action</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("handles click events properly", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button when disabled or isLoading is true", () => {
    const { rerender } = render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();

    rerender(<Button isLoading>Loading Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
  });
});
