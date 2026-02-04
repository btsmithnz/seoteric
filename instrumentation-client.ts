import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/chat/onboarding",
      method: "POST",
    },
  ],
});
