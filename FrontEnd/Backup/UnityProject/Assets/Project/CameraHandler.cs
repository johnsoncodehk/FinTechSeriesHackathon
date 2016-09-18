using UnityEngine;
using System.Collections;

[RequireComponent (typeof (Camera))]
public class CameraHandler : MonoBehaviour {

	public float maxSize;
	public int maxZoon;
	public float minSize {
		get {
			return this.maxSize * Mathf.Pow (0.5f, this.maxZoon);
		}
	}
	public int zoon;

	new private Camera camera;
	private float sizeV;

	void Awake () {
		this.camera = this.GetComponent<Camera> ();
	}

	void Update () {
		this.zoon = Mathf.Clamp (this.zoon, 0, this.maxZoon);
		float targetSize = this.maxSize * Mathf.Pow (0.5f, this.zoon);
		this.camera.orthographicSize = Mathf.SmoothDamp (this.camera.orthographicSize, targetSize, ref this.sizeV, 0.2f);
	}

	public void ZoomIn () {
		print ("ZoomIn");
		this.zoon++;
	}
	public void ZoomOut () {
		print ("ZoomOut");
		this.zoon--;
	}
}
