'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const cv = require('../data/cv.json');

const CV_IMAGES_DIR = path.join('assets', 'cv');

const PUBLIC_PERMISSIONS = {
  cv: ['find'],
};

function uid(model) {
  return `api::${model}.${model}`;
}

function getFileSizeInBytes(filePath) {
  return fs.statSync(filePath).size;
}

function getCvFileData(relativePath) {
  const filePath = path.join(CV_IMAGES_DIR, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`CV image not found: ${filePath}`);
  }

  const fileName = path.basename(relativePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size: getFileSizeInBytes(filePath),
    mimetype: mimeType,
  };
}

async function uploadCvFile(relativePath, altText) {
  const fileData = getCvFileData(relativePath);
  const name = path.basename(relativePath, path.extname(relativePath));

  const existing = await strapi.query('plugin::upload.file').findOne({
    where: { name },
  });

  if (existing) {
    return existing;
  }

  const [file] = await strapi.plugin('upload').service('upload').upload({
    files: fileData,
    data: {
      fileInfo: {
        alternativeText: altText || name,
        caption: name,
        name,
      },
    },
  });

  return file;
}

async function mediaId(relativePath, altText) {
  if (!relativePath) {
    return undefined;
  }

  try {
    const file = await uploadCvFile(relativePath, altText);
    return file.id;
  } catch (error) {
    console.warn(`Skipping image "${relativePath}": ${error.message}`);
    return undefined;
  }
}

async function upsertSingleType(model, data) {
  const documentUid = uid(model);
  const existing = await strapi.documents(documentUid).findFirst();

  if (existing) {
    await strapi.documents(documentUid).update({
      documentId: existing.documentId,
      data,
    });
    return;
  }

  await strapi.documents(documentUid).create({ data });
}

async function setPublicPermissions(permissions) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  const tasks = [];

  for (const [controller, actions] of Object.entries(permissions)) {
    for (const action of actions) {
      const actionName = `api::${controller}.${controller}.${action}`;

      const existing = await strapi.query('plugin::users-permissions.permission').findOne({
        where: {
          action: actionName,
          role: publicRole.id,
        },
      });

      if (!existing) {
        tasks.push(
          strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: actionName,
              role: publicRole.id,
            },
          })
        );
      }
    }
  }

  await Promise.all(tasks);
}

function mapHighlights(highlights) {
  return (highlights || []).map((text) => ({ text }));
}

function mapTechnologies(technologies) {
  return (technologies || []).map((name) => ({ name }));
}

function mapProjects(projects) {
  return (projects || []).map((project) => ({
    key: project.id,
    title: project.title,
    summary: project.summary,
    featured: project.featured || false,
    highlights: mapHighlights(project.highlights),
    technologies: mapTechnologies(project.technologies),
  }));
}

function mapEmployments(employments) {
  return (employments || []).map((employment) => ({
    key: employment.id,
    company: employment.company,
    role: employment.role,
    location: employment.location,
    startDate: employment.startDate,
    endDate: employment.endDate,
    projects: mapProjects(employment.projects),
  }));
}

function mapSkills(skills) {
  return (skills || []).map((name) => ({ name }));
}

async function importCv() {
  const photoId = await mediaId(cv.profile.photo, cv.profile.name);

  await upsertSingleType('cv', {
    profile: {
      name: cv.profile.name,
      title: cv.profile.title,
      summary: cv.profile.summary,
      email: cv.profile.email,
      phone: cv.profile.phone,
      location: cv.profile.location,
      githubUrl: cv.profile.githubUrl,
      linkedinUrl: cv.profile.linkedinUrl,
      photo: photoId,
    },
    employments: mapEmployments(cv.employments),
    education: cv.education,
    languages: cv.languages,
    skills: mapSkills(cv.skills),
  });
}

async function seedCv() {
  console.log('Setting public API permissions...');
  await setPublicPermissions(PUBLIC_PERMISSIONS);

  console.log('Importing CV content...');
  await importCv();

  console.log('CV seed completed successfully.');
}

module.exports = { seedCv };

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await seedCv();
  } catch (error) {
    console.error('CV seed failed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await app.destroy();
    process.exit(process.exitCode || 0);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
