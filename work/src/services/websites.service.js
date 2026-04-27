/**
 * src/services/websites.service.js
 * Business logic layer for Websites.
 * Schema: website_id, website_name, url, domain, createdAt, lastChecked, riskScore, security_rate, reputation, analysisDetails
 */
const prisma = require("./db.service");

/** Return all websites. */
const getAllWebsites = async ({ search } = {}) =>
  prisma.websites.findMany({
    where: search
      ? {
          OR: [
            { url: { contains: search, mode: "insensitive" } },
            { domain: { contains: search, mode: "insensitive" } },
            { website_name: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

/** Return a single website by ID, or null if not found. */
const getWebsiteById = async (id) =>
  prisma.websites.findUnique({
    where: { website_id: id },
    include: {
      reviews: {
        include: {
          users: { select: { user_id: true, username: true, email: true } },
        },
      },
    },
  });

const getWebsiteByDomain = async (domain) =>
  prisma.websites.findFirst({
    where: { domain: { equals: domain, mode: "insensitive" } },
    include: {
      reviews: {
        include: {
          users: { select: { user_id: true, username: true, email: true } },
        },
      },
    },
  });

const searchWebsites = async (query) =>
  prisma.websites.findMany({
    where: {
      OR: [
        { url: { contains: query, mode: "insensitive" } },
        { domain: { contains: query, mode: "insensitive" } },
        { website_name: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      reviews: false,
    },
    orderBy: { createdAt: "desc" },
  });

/** Create and return a new website. */
const createWebsite = async ({ website_name, url, domain, riskScore, security_rate, reputation, analysisDetails }) => {
  return prisma.websites.create({
    data: {
      website_name,
      url,
      domain,
      riskScore: riskScore || null,
      security_rate: security_rate || null,
      reputation: reputation || null,
      analysisDetails: analysisDetails || null,
    },
  });
};

/** Update an existing website; throws if not found. */
const updateWebsite = async (id, data) => {
  const exists = await prisma.websites.findUnique({ where: { website_id: id } });
  if (!exists) {
    const err = new Error("Website not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.websites.update({
    where: { website_id: id },
    data,
  });
};

/** Delete a website; throws if not found. */
const deleteWebsite = async (id) => {
  const exists = await prisma.websites.findUnique({ where: { website_id: id } });
  if (!exists) {
    const err = new Error("Website not found");
    err.statusCode = 404;
    throw err;
  }
  return prisma.websites.delete({ where: { website_id: id } });
};

module.exports = { getAllWebsites, getWebsiteById, getWebsiteByDomain, searchWebsites, createWebsite, updateWebsite, deleteWebsite };