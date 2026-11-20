import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { createContainer } from "./di/container";
import { fakeFetch, json, posts, users } from "./test/fake-fetch";

const byRoute = (url: string) => json(url.includes("/posts") ? posts : users);

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads the users into the sidebar and invites to pick one", async () => {
    render(
      <App
        container={createContainer({ fetchFunction: fakeFetch(byRoute) })}
      />,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Pick a user");
    expect(
      await screen.findByRole("button", {
        name: "Show posts by Leanne Graham",
      }),
    ).toBeInTheDocument();
  });

  it("shows the chosen user in the main area", async () => {
    render(
      <App
        container={createContainer({ fetchFunction: fakeFetch(byRoute) })}
      />,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Show posts by Ervin Howell" }),
    );
    const main = screen.getByRole("main");
    expect(main).not.toHaveTextContent("Pick a user");
    expect(
      within(main).getByRole("heading", { level: 2, name: "Ervin Howell" }),
    ).toBeInTheDocument();
    expect(main).toHaveTextContent("Shanna@melissa.tv");
    expect(main).toHaveTextContent("Works at Deckow-Crist");
    expect(await within(main).findByText("2 posts")).toBeInTheDocument();
    expect(within(main).getAllByRole("heading", { level: 4 })).toHaveLength(2);
  });

  it("scrolls the detail into view on a stacked layout", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: query.includes("max-width") }) as MediaQueryList,
    );
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    render(
      <App
        container={createContainer({ fetchFunction: fakeFetch(byRoute) })}
      />,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Show posts by Ervin Howell" }),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("keeps the chosen user when the language changes", async () => {
    render(
      <App
        container={createContainer({ fetchFunction: fakeFetch(byRoute) })}
      />,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Show posts by Ervin Howell" }),
    );
    await userEvent.click(screen.getByRole("radio", { name: "Spanish" }));
    expect(
      screen.getByRole("button", {
        name: "Ver las publicaciones de Ervin Howell",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("main")).toHaveTextContent(
      "Trabaja en Deckow-Crist",
    );
  });
});
