export interface User {
  id: number;
  name: string;
  email: string;
  imagepathh?: string | null;
  uuid?: string | null;
}

const hashStringToInt = (value: string): number => {
  let hash = 0;
  if (!value.length) return hash;
  for (let index = 0; index < value.length; index += 1) {
    const chr = value.charCodeAt(index);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const mapToUser = (data: Record<string, any>): User => {
  const idValue = data.id ?? data._id;
  let id = 0;
  let uuid: string | undefined;

  if (typeof idValue === "string") {
    uuid = idValue;
    id = hashStringToInt(idValue);
  } else if (typeof idValue === "number") {
    id = idValue;
  }

  return {
    id,
    uuid: uuid ?? (typeof data.uuid === "string" ? data.uuid : undefined),
    name: (data.name ?? data.nombre ?? "").toString(),
    email: (data.email ?? data.correo ?? "").toString(),
    imagepathh:
      data.avatarUrl ?? data.image ?? data.imagen ?? data.imagepathh ?? null,
  };
};

export const mapUserToJson = (user: User): Record<string, any> => ({
  id: user.uuid ?? user.id,
  name: user.name,
  email: user.email,
  image: user.imagepathh ?? null,
});
