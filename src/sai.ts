import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { Application } from "@janeirodigital/interop-application";
import { Agent, Project, Registration, Task, FileInstance, ImageInstance } from "@/models";
import { ACL, RDFS, buildNamespace } from "@janeirodigital/interop-utils";
import { DataInstance } from "@janeirodigital/interop-data-model";

const cache: { [key: string]: DataInstance } = {}
const ownerIndex: { [key: string]: string } = {}

const NFO = buildNamespace('http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#')
const AWOL = buildNamespace('http://bblfish.net/work/atom-owl/2006-06-06/#')

const shapeTrees = {
  project: 'http://localhost:3000/shapetrees/trees/Project',
  task: 'http://localhost:3000/shapetrees/trees/Task',
  image: 'http://localhost:3000/shapetrees/trees/Image',
  file: 'http://localhost:3000/shapetrees/trees/File',
}

function instance2Project(instance: DataInstance, owner: string, registration: string): Project {
  return {
    id: instance.iri,
    label: instance.getObject(RDFS.label)!.value,
    owner,
    registration,
    canUpdate: instance.accessMode.includes(ACL.Update.value),
    canAddTasks: instance.findChildGrant(shapeTrees.task)?.accessMode.includes(ACL.Create.value),
    canAddImages: instance.findChildGrant(shapeTrees.image)?.accessMode.includes(ACL.Create.value),
    canAddFiles: instance.findChildGrant(shapeTrees.file)?.accessMode.includes(ACL.Create.value),
  }
}

function instance2Task(instance: DataInstance, project: string, owner: string): Task {
  return {
    id: instance.iri,
    label: instance.getObject(RDFS.label)!.value,
    project,
    owner,
    canUpdate: instance.accessMode.includes(ACL.Update.value),
    canDelete: instance.accessMode.includes(ACL.Delete.value),
  }
}

function instance2File(instance: DataInstance, project: string, owner: string): Image {
  return {
    id: instance.iri,
    filename: instance.getObject(NFO.fileName)?.value,
    project,
    owner,
    canUpdate: instance.accessMode.includes(ACL.Update.value),
    canDelete: instance.accessMode.includes(ACL.Delete.value),
  }
}

function getAccessModes(task: Task) {
  const project = cache[task.project]
  if (!project) {
    throw new Error(`Project not found for: ${task.project}`)
  }

  const dataGrant = project.findChildGrant(shapeTrees.task)
  return {
    canUpdate: dataGrant.accessMode.includes(ACL.Update.value),
    canDelete: dataGrant.accessMode.includes(ACL.Delete.value)
  }

}

let saiSession: Application | undefined;
let webId: string

const authnFetch = getDefaultSession().fetch;

export function useSai(userId: string | null) {
  if (saiSession) {
    if (saiSession.webId !== webId) throw new Error('WebId mismatch!')
  } else {
    if (!userId) throw new Error('no user id')
    webId = userId
  }

  return {
    isAuthorized,
    getAuthorizationRedirectUri,
    getAgents,
    getProjects,
    getTasks,
    updateTask,
    deleteTask,
    getFiles,
    getImages,
    dataUrl,
    getAccessModes,
  }
}

async function ensureSaiSession(): Promise<Application> {
  if (saiSession) return saiSession
  const deps = { fetch: authnFetch, randomUUID: crypto.randomUUID.bind(crypto) }
  return saiSession = await Application.build(webId, import.meta.env.VITE_APPLICATION_ID, deps)
}

async function isAuthorized(): Promise<boolean> {
  const session = await ensureSaiSession()
  return !!session.hasApplicationRegistration?.hasAccessGrant.granted
}

async function getAuthorizationRedirectUri(): Promise<string> {
  const session = await ensureSaiSession()
  return session.authorizationRedirectUri
}

async function getAgents(): Promise<Agent[]> {
  const session = await ensureSaiSession()

  const profiles = await Promise.all(
    session.dataOwners.map(owner => session.factory.readable.webIdProfile(owner.iri))
  )

  return profiles.map(profile => ({
    id: profile.iri,
    label: profile.label || 'unknown' // TODO think of a better fallback
  }))
}

async function getProjects(ownerId: string): Promise<{ownerId: string, projects: Project[], registrations: Registration[]}> {
  const session = await ensureSaiSession()
  const user = session.dataOwners.find((agent) => agent.iri === ownerId);
  if (!user) {
    throw new Error(`data registration not found for ${ownerId}`)
  }
  const projects: Project[] = [];
  const registrations: Registration[] = [];
  for (const registration of user.selectRegistrations(shapeTrees.project)) {
    registrations.push({
        id: registration.iri,
        label: 'TODO',
        owner: ownerId,
        canCreate: registration.grant.accessMode.includes(ACL.Create.value),
    })
    for await (const dataInstance of registration.dataInstances) {
      cache[dataInstance.iri] = dataInstance
      ownerIndex[dataInstance.iri] = ownerId
      projects.push(instance2Project(dataInstance, ownerId, registration.iri));
    }
  }
  return {ownerId, projects, registrations}
}


async function getTasks(projectId: string): Promise<{projectId: string, tasks: Task[]}> {
  await ensureSaiSession()
  const project = cache[projectId]
  if (!project) {
    throw new Error(`Project not found for: ${projectId}`)
  }
  const tasks = [];
  for await (const dataInstance of project.getChildInstancesIterator(shapeTrees.task)) {
    cache[dataInstance.iri] = dataInstance
    tasks.push(instance2Task(dataInstance, projectId, ownerIndex[projectId]));
  }

  return {projectId, tasks}
}

async function updateTask(task: Task): Promise<void> {
  await ensureSaiSession()
  let instance: DataInstance
  if (task.id !== 'DRAFT') {
    const cached = cache[task.id]
    if (!cached) {
      throw new Error(`Data Instance not found for: ${task.id}`)
    }
    instance = cached
  } else {
    const project = cache[task.project]
    if (!project) {
      throw new Error(`project not found ${task.project}`)
    }
    instance = await project.newChildDataInstance(shapeTrees.task)
    cache[instance.iri] = instance
  }

  instance.replaceValue(RDFS.label, task.label);

  await instance.update(instance.dataset)
}


async function deleteTask(task: Task): Promise<void> {
  await ensureSaiSession()
  let instance: DataInstance

  instance = cache[task.id];
  await instance.delete();

  delete cache[task.id];
}

async function getFiles(projectId: string): Promise<{projectId: string, files: FileInstance[]}> {
  await ensureSaiSession()
  const project = cache[projectId]
  if (!project) {
    throw new Error(`Project not found for: ${projectId}`)
  }
  const files = [];
  for await (const dataInstance of project.getChildInstancesIterator(shapeTrees.file)) {
    cache[dataInstance.iri] = dataInstance
    files.push(instance2File(dataInstance, projectId, ownerIndex[projectId]));
  }

  return {projectId, files}
}

async function getImages(projectId: string): Promise<{projectId: string, images: ImageInstance[]}> {
  await ensureSaiSession()
  const project = cache[projectId]
  if (!project) {
    throw new Error(`Project not found for: ${projectId}`)
  }
  const images = [];
  for await (const dataInstance of project.getChildInstancesIterator(shapeTrees.image)) {
    cache[dataInstance.iri] = dataInstance
    images.push(instance2File(dataInstance, projectId, ownerIndex[projectId]));
  }

  return {projectId, images}
}


async function dataUrl(url: string): Promise<string> {
  const fetch = getDefaultSession().fetch
  return fetch(url)
    .then(response => response.blob())
    .then(blb => URL.createObjectURL(blb))
}
