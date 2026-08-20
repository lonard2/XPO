import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/components/ui/Modal";

describe("UI Primitive: Modal", () => {
  it("renders when isOpen is true and hides when false", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Event Modal">
        Modal Content
      </Modal>
    );
    expect(screen.getByText("Event Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Event Modal">
        Modal Content
      </Modal>
    );
    expect(screen.queryByText("Event Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        Content
      </Modal>
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
