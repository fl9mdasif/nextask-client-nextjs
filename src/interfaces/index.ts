// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  status: Status;
  due_date: string;       // 'YYYY-MM-DD'
  tags: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  priority: Priority;
  status: Status;
  due_date: string;
  tags: string[];
  order?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  priority?: Priority;
  status?: Status;
  due_date?: string;
  tags?: string[];
  order?: number;
}

export interface ReorderTaskPayload {
  status: Status;
  order: number;
}

// ─── Annotation ──────────────────────────────────────────────────────────────

export interface AnnotationImage {
  id: number;
  name: string;
  image: string;          // URL returned by backend
  uploaded_at: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: number;
  image: number;
  points: Point[];
  label: string;
  color: string;
  created_at: string;
}

export interface CreatePolygonPayload {
  points: Point[];
  label?: string;
  color?: string;
}

// ─── Zustand Stores ──────────────────────────────────────────────────────────

export interface TaskStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  fetchTasks: (date: string) => Promise<void>;
}

export interface AnnotateStore {
  images: AnnotationImage[];
  activeImage: AnnotationImage | null;
  polygons: Polygon[];
  setActiveImage: (image: AnnotationImage) => void;
  fetchImages: () => Promise<void>;
  fetchPolygons: (imageId: number) => Promise<void>;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface DateSelectorProps {
  selected: Date;
  onChange: (date: Date) => void;
}

export interface ColumnProps {
  title: 'To Do' | 'In Progress' | 'Done';
  status: Status;
  tasks: Task[];
}

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  status: Status;
  onClose: () => void;
  onSave: () => void;
}

export interface AnnotationCanvasProps {
  image: AnnotationImage;
  polygons: Polygon[];
  onPolygonSave: (points: Point[]) => void;
  onPolygonDelete: (id: number) => void;
}
