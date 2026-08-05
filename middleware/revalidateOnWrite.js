const { revalidateFrontend } = require("../utils/revalidateFrontend");

/**
 * After any successful content write, ping the public site to re-render the
 * pages that section feeds. Applied once globally rather than in each of the
 * ~40 controller handlers.
 */

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// First path segment after /api/  ->  routes on the public site
const SECTION_PATHS = {
  home: ["/"],
  about: ["/about"],
  gallery: ["/gallery"],
  kiwano: ["/kiwano"],
  "kiwano-villament": ["/kiwano-villament"],
  services: ["/services"],
  "testimonials-main": ["/testimonial"],
  "projects-main": ["/project-list"],
  projects: ["/project-list"],
};

const pathsForRequest = (req) => {
  // "/api/kiwano-villament/main/hero?x=1" -> "kiwano-villament"
  const [, api, section] = req.originalUrl.split("?")[0].split("/");
  if (api !== "api") return [];
  return SECTION_PATHS[section] || [];
};

const revalidateOnWrite = (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  const paths = pathsForRequest(req);
  if (paths.length === 0) return next();

  const sendJson = res.json.bind(res);
  let handled = false;

  res.json = (body) => {
    if (handled) return sendJson(body);
    handled = true;

    // Failed saves changed nothing.
    if (res.statusCode >= 400) return sendJson(body);

    // Ping first, answer the admin second: on serverless the invocation can
    // be frozen the moment the response goes out, which would cut a
    // fire-and-forget request short. revalidateFrontend never rejects.
    revalidateFrontend(paths).finally(() => sendJson(body));
    return res;
  };

  next();
};

module.exports = { revalidateOnWrite, SECTION_PATHS };
